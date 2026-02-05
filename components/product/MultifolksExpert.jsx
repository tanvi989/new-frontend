export default function MultifolksExpert() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-red-500 to-orange-500">
      <div className="container mx-auto px-6 py-20">
        <div className="flex items-start gap-16">
          {/* Left Column */}
          <div className="flex-1">
            {/* Logo */}
            <div className="mb-12 w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full fill-white">
                <path d="M24 4C13.5 4 5 12.5 5 23c0 10.5 8.5 19 19 19s19-8.5 19-19-8.5-19-19-19zm0 34c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" />
              </svg>
            </div>

            {/* Main Text */}
            <p className="text-white text-lg leading-relaxed max-w-md">
              We're passionate about the power of multifocals to make life better, whether you wear glasses all the time
              or on-and-off. It's why multifocals are the one and only thing we focus on.
            </p>
          </div>

          {/* Middle Column */}
          <div className="flex-1 space-y-8">
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Multifocal experts</h3>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Exclusively online</h3>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Accurate lens fitting</h3>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">100s of designs</h3>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-12">
            <div>
              <p className="text-white text-sm opacity-90">Our team come with 20+ years in the eyewear industry</p>
            </div>
            <div>
              <p className="text-white text-sm opacity-90">All you need is your prescription and we do the rest</p>
            </div>
            <div>
              <p className="text-white text-sm opacity-90">The world's most advanced online multifocal fitting</p>
            </div>
            <div>
              <p className="text-white text-sm opacity-90">Including leading brands</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
