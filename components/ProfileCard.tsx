import React from "react";
import { Profile } from "../types";

interface ProfileCardProps {
  profile: Profile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="group relative bg-white rounded-[12px] p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(31,31,31,1)] shadow-[3px_3px_0px_0px_rgba(31,31,31,1)] border-2 border-charcoal flex flex-col h-full overflow-hidden">
      {/* Image Container - Aspect Ratio 3:4 */}
      <div className="relative w-full aspect-[3/4] overflow-hidden border-b-2 border-charcoal bg-cream">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
        />

        {profile.available && (
          <div className="absolute top-3 left-3 bg-[#E0F2E9] border-2 border-charcoal px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(31,31,31,1)] z-10">
            <span className="w-2 h-2 rounded-full bg-[#2D4628] animate-pulse"></span>
            <span className="text-[10px] font-bold text-[#2D4628] tracking-wide uppercase">
              Available
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4 bg-white">
        <div className="mb-3">
          <h3 className="text-xl font-serif font-bold text-charcoal leading-tight mb-0.5 group-hover:text-burnt-orange transition-colors">
            {profile.name}
          </h3>
          <p className="text-sm font-bold text-charcoal/60">{profile.role}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded border border-charcoal/20 bg-cream/50 text-charcoal/80 text-[10px] font-bold uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer / Socials */}
        <div className="mt-auto pt-3 border-t-2 border-charcoal/10 flex items-center justify-between">
          <div className="flex gap-2">
            {profile.socials?.twitter && (
              <a
                href={profile.socials.twitter}
                className="p-1.5 rounded-md hover:bg-cream text-charcoal hover:text-burnt-orange transition-colors border border-transparent hover:border-charcoal"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            )}
            {profile.socials?.linkedin && (
              <a
                href={profile.socials.linkedin}
                className="p-1.5 rounded-md hover:bg-cream text-charcoal hover:text-burnt-orange transition-colors border border-transparent hover:border-charcoal"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            )}
          </div>

          <button className="text-[10px] font-bold uppercase tracking-wider bg-charcoal text-white px-3 py-1.5 rounded border border-charcoal hover:bg-white hover:text-charcoal transition-all">
            View
          </button>
        </div>
      </div>
    </div>
  );
};
