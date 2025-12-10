'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function JudgeKeyModal({
    isJudge,
    onClaim,
    onLeave,
}: {
    isJudge: boolean;
    onClaim: (key: string) => Promise<void> | void;
    onLeave: () => Promise<void> | void;
}) {
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState('');

    if (isJudge) {
        return (
            <div className="mt-2">
                <Button variant="secondary" onClick={onLeave}>Leave Judge Mode</Button>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Enter Judge Key</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Judge Key</DialogTitle>
                </DialogHeader>

                <input
                    className="w-full bg-zinc-800 text-zinc-100 rounded px-3 py-2 outline-none"
                    placeholder="Paste the judge key…"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            if (!key.trim()) return;
                            await onClaim(key.trim());
                            setKey('');
                            setOpen(false);
                        }}
                    >
                        Claim Judge
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
