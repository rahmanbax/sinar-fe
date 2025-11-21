"use client"
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function timeAgo(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime(); // difference in milliseconds

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

const MyTeamCard: React.FC<{ name: string; lastAuth?: Date; email: string }> = ({
    name,
    lastAuth,
    email
}) => {
    return (
        <Card className="overflow-hidden text-center py-0 gap-0 bg-transparent shadow-none w-3/4 sm:w-full">
            {/* Top Section (blue background) */}
            <div className="bg-[#DBECFD] h-20 relative">
                {/* Icon overlaps between top and bottom */}
                <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
                    <CircleUserRound className="w-24 h-24 text-black" />
                </div>
            </div>

            {/* Bottom Section */}
            <CardContent className="bg-[#DBECFD] rounded-t-2xl p-0 shadow-md">
                <div className="bg-white pt-12 pb-6">
                    <h3 className="text-lg font-medium">{name}</h3>
                    {lastAuth && (
                        <h5 className="text-sm text-gray-500">
                            Terakhir masuk {timeAgo(lastAuth)}
                        </h5>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
                        <span>{email}</span>
                    </div>
                    <Button className="mt-4 bg-[#1378B7] hover:bg-blue-300 text-white px-4 py-2 rounded-full">
                        Kirim Pesan
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

const MyTeamTab: React.FC = () => {
    const teams = [
        { name: 'John Doe', lastAuth: new Date('2025-11-10'), email: 'johndoe@mail.com' },
        { name: 'John Doe', lastAuth: new Date('2025-11-10'), email: 'johndoe@mail.com' },
        { name: 'John Doe', lastAuth: new Date('2025-11-10'), email: 'johndoe@mail.com' },
        { name: 'John Doe', lastAuth: new Date('2025-11-10'), email: 'johndoe@mail.com' },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 place-items-center">
            {teams.map((item, i) => (
                <MyTeamCard
                    key={i}
                    email={item.email}
                    name={item.name}
                    lastAuth={item.lastAuth}
                />
            ))}
        </div>
    )
}

export default MyTeamTab