"use client"
import { useEffect, useState, useRef, Fragment } from 'react';
import initWebSocket from './client';
import VideoPlayer from './videoPlayer';
import { VideoPlayerRef } from './videoPlayer';
import AutoExpandTextarea from './autoExpandTextArea';
import chatting_png from "./images/chatting.png";

let setCurrentTimeFunc: any;
let sendCurrentTimeFunc: any;
let sendMessageFunc: any;
let triggerRenderLista: any;
let triggerRenderListb: any;

let lista: any = {};
let listb: any[] = [];

let { connectWebSocket, setCurrentTime, sendCurrentTime, getClientId, sendMessage } = initWebSocket((incomingMsg: string) => {
  let result = JSON.parse(incomingMsg);
  if (result.clientId != null) {
    if (result.clientId !== getClientId() && result.currentTime) {
      console.log(result.clientId + '/' + getClientId());
      lista = { ...lista, [result.clientId]: result };
      if (triggerRenderLista != null)
        triggerRenderLista(lista);
    } else if (result.message) {
      result.currentTimeFrame = Date.now();
      listb = [result, ...listb];
      triggerRenderListb(listb);
    }
  }
});
setCurrentTimeFunc = setCurrentTime;
sendCurrentTimeFunc = sendCurrentTime;
sendMessageFunc = sendMessage;
connectWebSocket();

export default function Home() {
  const videoPlayerRef = useRef<VideoPlayerRef | null>(null);
  const [results, setResults] = useState<{ [clientId: string]: any }>({});
  const [resultsb, setResultsb] = useState<{ messages: any[], hasNewMessage: boolean }>({ messages: [], hasNewMessage: false });
  const [currentClientIndex, setCurrentClientIndex] = useState(0);
  const [favoriteClients, setFavoriteClients] = useState<string[]>([]);
  const [showClientMenu, setShowClientMenu] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  function handleItemClick(currentTime: number, options?: { autoplay?: boolean }) {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime(currentTime);
      if (options?.autoplay) {
        videoPlayerRef.current.play();
      }
    }
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    triggerRenderLista = (data: any) => {
      setResults((prevResults) => ({
        ...prevResults,
        ...data,
      }));
    };
  }, []);

  useEffect(() => {
    triggerRenderListb = (data: any) => {
      setResultsb((prevState) => ({
        messages: data,
        hasNewMessage: true,
      }));
      if (bottomRef.current) {
        // bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const clients = Object.values(results);
      if (clients.length > 0) {
        if (favoriteClients.length > 0) {
          const favoriteClient = clients.find((client: any) => favoriteClients.includes(client.clientId));
          if (favoriteClient) {
            const index = clients.indexOf(favoriteClient);
            setCurrentClientIndex(index);
          } else {
            setCurrentClientIndex((prevIndex) => (prevIndex + 1) % clients.length);
          }
        } else {
          setCurrentClientIndex((prevIndex) => (prevIndex + 1) % clients.length);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [results, favoriteClients]);

  function handleOpenClientMenu() {
    setShowClientMenu(!showClientMenu);
  }

  function handleFavoriteClient(clientId: string) {
    if (favoriteClients.includes(clientId)) {
      setFavoriteClients((prevFavoriteClients) => prevFavoriteClients.filter((id) => id !== clientId));
    } else {
      setFavoriteClients((prevFavoriteClients) => [...prevFavoriteClients, clientId]);
    }
  }

  const clients = Object.values(results);
  const currentClient = clients[currentClientIndex];

  return (
    <main className="min-h-screen">
      <VideoPlayer
        url={'http://localhost:3002/video'}
        listener={(time: string) => {
          if (setCurrentTimeFunc != null) setCurrentTimeFunc(time);
          if (sendCurrentTimeFunc != null) sendCurrentTimeFunc();
        }}
        ref={videoPlayerRef}
      />

      <div className='sticky top-0 z-10 bg-slate-50 dark:bg-slate-950'>
        {currentClient && (
          <div className="px-4 py-2  pb-4">
            <ul role="list" className="">
              <li className="flex justify-between">
                <div
                  className="  mt-2 flex items-center justify-center gap-x-2   bg-transparent   rounded-md pr-2    flex items-center justify-between   w-full "
                >


                  <div className=" relative  ">
                    <span className="cursor-pointer relative  inline-flex items-center rounded-full bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10" onClick={handleOpenClientMenu}>Pin</span>

                    {showClientMenu && (
                      <div className=" absolute bg-white dark:bg-neutral-900  rounded-md shadow-lg p-2 z-10">

                        <ul role="list" className="space-y-2">

                          {clients.map((client: any) => (
                            <li key={client.clientId}>
                              <button
                                className="flex items-center space-x-2"
                                onClick={() => handleFavoriteClient(client.clientId)}
                              >

                                <div
                                  className="cursor-pointer mt-2 flex items-center  gap-x-1 group bg-transparent hover:bg-gray-200 rounded-md p-1 dark:hover:bg-gray-900"
                                  onClick={() => handleItemClick(currentClient.currentTime)}
                                >
                                  {favoriteClients.includes(client.clientId) ? (
                                    <span className="text-yellow-500">★</span>
                                  ) : (
                                    <span className="text-gray-500">☆</span>
                                  )}
                                  <span className=" inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-neutral-900">
                                    <div className='w-2'></div>
                                    <img src={client.clientAvatar} className="h-4 inline mr-1" alt="Client Avatar" />
                                    {client.clientId}

                                  </span>
                                  <p className="font-normal text-xs text-neutral-400 dark:text-zinc-700">{formatTime(client.currentTime)}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>

                      </div>
                    )}
                  </div>
                  <div className='cursor-pointer flex items-center hover:bg-gray-200 rounded-md pr-2 dark:hover:bg-gray-900' onClick={() => handleItemClick(currentClient.currentTime)}>
                    <span className={favoriteClients.includes(currentClient.clientId) ? "inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-500 dark:text-yellow-600 ring-1 ring-inset ring-yellow-500 dark:ring-yellow-600 dark:bg-yellow-900" : "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-neutral-900"}>
                      <img src={currentClient.clientAvatar} className="h-4 inline mr-1" alt="Client Avatar" />
                      {currentClient.clientId}
                    </span>
                    <div className='w-1'></div>
                    <p className="font-normal text-xs text-neutral-400 dark:text-zinc-700"> at {formatTime(currentClient.currentTime)} </p>

                  </div>

                </div>


              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex-1 ">
        {resultsb.messages.length > 0 ? (
          <div className=" ">
            <ul role="list" className="">
              {resultsb.messages.map((client, index) => (
                <li className="flex justify-between" key={client.clientId + "-" + client.currentTimeFrame + "-" + client.message}>
                  <div className="w-full hover:bg-gray-200 rounded-md dark:hover:bg-neutral-900  px-4 py-1">
                    <div className="cursor-pointer flex items-center justify-between group w-full">
                      <div className='inline-flex '>
                        <div className='relative'>
                          {index === 0 && (
                            <div className="absolute">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                              </span>
                            </div>
                          )}
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-neutral-900 min-w-">
                            <img src={client.clientAvatar} className="h-4 inline mr-1" alt="Client Avatar" />
                            {client.clientId}
                          </span>
                        </div>
                      </div>
                      <p className="font-normal text-xs text-neutral-400 dark:text-zinc-700 text-right">
                        {Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(client.currentTimeFrame)}
                      </p>
                    </div>
                    <p className="font-normal text-xs text-neutral-400 dark:text-zinc-700 flex-grow py-2 px-1">
                      {client.message.split("\n").map((line: any, index: number) => (
                        < Fragment key={index}>
                          {line}
                          <br />
                        </ Fragment>
                      ))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div ref={bottomRef} />
          </div>
        ) : (
          <img src={chatting_png.src} className="h-auto w-auto p-40 " alt="chatting" />

        )}
        <div className="h-20"></div>
      </div>

      <div className="fixed p-5 w-full md:w-auto bottom-0 m-2 drop-shadow-xl">
        <AutoExpandTextarea onSend={(v: string) => sendMessage(v)}></AutoExpandTextarea>
      </div>



    </main >
  );
}
