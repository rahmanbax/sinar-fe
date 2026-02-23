import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon } from "lucide-react";
import { StatMap } from "./StatMap";
import { ReactNode } from "react";

interface MapModalProps {
    trigger?: ReactNode;
}

export const MapModal = ({ trigger }: MapModalProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="lg">
                        <MapIcon className="mr-2" /> Lihat Peta
                    </Button>

                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] h-[90vh] flex flex-col p-4 gap-4">
                <DialogHeader className="px-2">
                    <DialogTitle>Peta Sebaran Toponim</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 w-full rounded-md border overflow-hidden">
                    <StatMap />
                </div>
            </DialogContent>
        </Dialog>
    );
};
