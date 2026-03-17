"use client";

import { motion } from "framer-motion";
import { Download, ArrowRight, CheckCircle, ShieldCheck, Zap } from "lucide-react";

export default function PartnershipPage() {
    return (
        <div className="min-h-screen bg-[#F9F9F9] pt-20">
            <div className="container mx-auto px-6 py-24">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl"
                >
                    <span className="text-[#0F3D2E] font-bold text-sm tracking-widest uppercase mb-4 block">For Event Professionals</span>
                    <h1 className="text-5xl md:text-7xl font-bold font-sebooth text-[#1A1A1A] mb-8 tracking-tighter loading-none">
                        The Best Friend of <br /> EOs & WOs.
                    </h1>
                    <p className="text-xl text-[#1A1A1A]/70 mb-12 max-w-2xl leading-relaxed">
                        We understand that for an organizer, <strong>reliability is everything.</strong>
                        Sebooth provides a "zero-worry" photobooth experience that fits seamlessly into your premium decor, backed by industrial-grade stability.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-20 border-t border-[#1A1A1A]/10 pt-20">

                    {/* Benefits Column */}
                    <div>
                        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8 font-sebooth">Partner Benefits</h3>
                        <ul className="space-y-8">
                            <li className="flex gap-4">
                                <div className="bg-[#D4AF37]/10 p-3 h-fit rounded-none">
                                    <Zap className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0F3D2E] text-lg">Lucrative Commission</h4>
                                    <p className="text-[#1A1A1A]/70 leading-relaxed mt-1">
                                        Earn a transparent <strong>10-15% commission</strong> on every booking, or choose a net-rate scheme to markup as you please.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="bg-[#1A1A1A]/5 p-3 h-fit rounded-none">
                                    <ShieldCheck className="w-6 h-6 text-[#1A1A1A]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0F3D2E] text-lg">Whitelabel Option</h4>
                                    <p className="text-[#1A1A1A]/70 leading-relaxed mt-1">
                                        Your brand, not ours. For premium events, we offer a fully unbranded "Ghost Mode" where the booth appears as your in-house service.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="bg-[#0F3D2E]/5 p-3 h-fit rounded-none">
                                    <CheckCircle className="w-6 h-6 text-[#0F3D2E]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0F3D2E] text-lg">Dedicated Coordinator</h4>
                                    <p className="text-[#1A1A1A]/70 leading-relaxed mt-1">
                                        Direct access to a technical lead. No call centers, no delays. Priority support for all your events.
                                    </p>
                                </div>
                            </li>
                        </ul>

                        <button className="mt-12 px-8 py-4 bg-[#1A1A1A] text-white font-bold flex items-center gap-3 hover:bg-[#000] transition-colors">
                            <Download className="w-5 h-5" />
                            Download Partner Rate Card
                        </button>
                    </div>

                    {/* Inquiry Form Column */}
                    <div className="bg-[#EAEAEA] p-10 h-fit">
                        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6 font-sebooth">Join Our Network</h3>
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">Agency / Company Name</label>
                                <input type="text" className="w-full bg-white border-none p-4 text-[#1A1A1A] focus:ring-1 focus:ring-[#0F3D2E] outline-none" placeholder="Ex: Majestic Events" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">Contact Person</label>
                                    <input type="text" className="w-full bg-white border-none p-4 text-[#1A1A1A] focus:ring-1 focus:ring-[#0F3D2E] outline-none" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">WhatsApp</label>
                                    <input type="tel" className="w-full bg-white border-none p-4 text-[#1A1A1A] focus:ring-1 focus:ring-[#0F3D2E] outline-none" placeholder="+62..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">Est. Events per Year</label>
                                <select className="w-full bg-white border-none p-4 text-[#1A1A1A] focus:ring-1 focus:ring-[#0F3D2E] outline-none">
                                    <option>1 - 5 Events</option>
                                    <option>5 - 10 Events</option>
                                    <option>10 - 20 Events</option>
                                    <option>20+ Events (VIP Partner)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">Message / Special Request</label>
                                <textarea className="w-full bg-white border-none p-4 text-[#1A1A1A] focus:ring-1 focus:ring-[#0F3D2E] outline-none h-32 resize-none" placeholder="Tell us about your typical event needs..." />
                            </div>

                            <button className="w-full py-4 bg-[#0F3D2E] text-white font-bold hover:bg-[#195240] transition-colors flex justify-center items-center gap-2">
                                Apply for Partnership <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
