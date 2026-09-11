"use client";

import React, { useState } from "react";
import { ConnectedSystem } from "@/lib/types/situation";
import { Building2, ShieldCheck, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

interface SystemConnectorsProps {
  systems: ConnectedSystem[];
}

export function SystemConnectors({ systems }: SystemConnectorsProps) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  const handleSimulateVerify = async (sysId: string) => {
    setVerifyingId(sysId);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId: sysId }),
      });
      if (res.ok) {
        setVerifiedMap((prev) => ({ ...prev, [sysId]: true }));
      }
    } catch (e) {
      console.warn("Verification failed", e);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Connected Public & Private Systems ({systems.length})
          </h3>
          <p className="text-xs text-slate-400">
            Siloed institutional directories mapped automatically from the situation:
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/80 text-[10px] font-mono text-sky-300">
          <ShieldCheck className="w-3 h-3 text-sky-400" />
          <span>Simulated Directory Layer</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {systems.map((sys) => {
          const isVerified = verifiedMap[sys.id];
          const isPending = verifyingId === sys.id;

          return (
            <div
              key={sys.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{sys.name}</span>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {sys.agencyType.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  {sys.purpose}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Contact Channel:</span>
                    <span className="font-mono text-indigo-300 truncate max-w-[180px]">
                      {sys.contactChannel}
                    </span>
                  </div>

                  <div className="text-slate-400">
                    <span className="font-medium text-slate-300">Required Documents:</span>{" "}
                    {sys.requiredDocuments.join(", ")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 italic">
                  {sys.disclaimer}
                </span>

                <button
                  type="button"
                  onClick={() => handleSimulateVerify(sys.id)}
                  disabled={isVerified || isPending}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    isVerified
                      ? "bg-sky-950/80 text-sky-300 border border-sky-800/80 cursor-default"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                      <span>Checking...</span>
                    </>
                  ) : isVerified ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-sky-400" />
                      <span>Verified Criteria</span>
                    </>
                  ) : (
                    <>
                      <span>Test Eligibility</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
