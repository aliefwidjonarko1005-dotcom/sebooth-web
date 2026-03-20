"use client";


export function Location() {
    return (
        <section id="location" className="py-0">
            <div className="w-full h-[600px] bg-[#E5E5E5] relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#0F3D2E]/5 z-10 pointer-events-none" />
                <div className="text-center space-y-4 z-20">
                    <h2 className="text-3xl font-bold text-[#1A1A1A] font-sebooth">Visit Our Studio</h2>
                    <div className="bg-white p-6 shadow-xl max-w-sm mx-auto">
                        <p className="font-bold text-[#1A1A1A]">Sebooth HQ</p>
                        <p className="text-[#1A1A1A]/70 text-sm mt-2">
                            Jl. Photobooth Premium No. 12<br />
                            Semarang Selatan, Jawa Tengah 50241
                        </p>
                        <a
                            href="https://maps.google.com"
                            target="_blank"
                            className="block mt-4 text-[#0F3D2E] font-bold text-sm hover:underline"
                        >
                            Get Directions &rarr;
                        </a>
                    </div>
                    <p className="text-[#1A1A1A]/30 font-bold">[Google Maps Embed Placeholer]</p>
                </div>
            </div>
        </section>
    );
}
