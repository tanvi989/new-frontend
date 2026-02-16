"use client";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  const goTo = (path: string) => () => navigate(path);

  return (
    <>
      {/* Desktop Version */}
      <section className="hidden lg:block relative w-full h-[100vh] overflow-hidden ">
        {/* Background GIF */}
        <img
          src="/images/herogif.gif"
          alt="Hero Background"
          width="1920"
          height="1080"
          className="absolute inset-0 w-full h-full object-cover object-[50%_45%]"
        />
        {/* Content at very bottom */}
        <div className="relative h-full flex flex-col justify-end items-center text-center px-4 pb-8">
          <div>
            <span className="text-2xl lg:text-4xl text-white mb-8 [word-spacing:0.1px]   line-height:[48px]">
              Welcome to MultiFolks
              <br />
              The worlds multifocal specialists.
            </span>
            <div
              className="flex gap-4 justify-center mt-10"
            >
              <button
                onClick={goTo("/glasses?gender=Men")}
                aria-label="Shop Men's Glasses"
                className="w-56 px-4 py-3 bg-black text-white text-base lg:text-lg font-semibold rounded-full hover:bg-black transition uppercase tracking-wide"
              >
                MEN
              </button>
              <button
                onClick={goTo("/glasses?gender=Women")}
                aria-label="Shop Women's Glasses"
                className="w-56 px-4 py-3 bg-white text-gray-900 text-base lg:text-lg font-semibold rounded-full hover:bg-gray-100 transition uppercase tracking-wide"
              >
                WOMEN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Version */}
      <section className="lg:hidden relative w-full h-[100dvh] overflow-hidden">
        {/* Background GIF */}
        <img
          src="/images/herogif.gif"
          alt="Hero Background"
          width="1080"
          height="1920"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Content at very bottom */}
        <div className="relative h-full flex flex-col justify-end items-center text-center px-4 pb-6">
          <div className="mb-8 w-full max-w-sm">
            {/* Text in 3 lines for mobile with same size as desktop */}
            <span className="text-2xl lg:text-4xl text-white mb-6 block [word-spacing:0.1px] leading-tight">
              Welcome to MultiFolks
              <br />
              The world's multifocal
              <br />
              specialists.
            </span>

            <div className="flex gap-3 mt-8">
              {/* You can change these paths to whatever you actually need */}
              <button
                onClick={goTo("/glasses?gender=Men")}
                aria-label="Shop Men's Glasses"
                className="flex-1 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-900 transition uppercase tracking-widest"
              >
                MEN
              </button>

              <button
                onClick={goTo("/glasses?gender=Women")}
                aria-label="Shop Women's Glasses"
                className="flex-1 py-3 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 transition uppercase tracking-widest"
              >
                WOMEN
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
