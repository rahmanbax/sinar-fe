import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Photo {
    url: string;
    name: string;
}

interface PhotoPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewImage: Photo | null;
    allPhotos: Photo[];
    onPrev: (e?: React.MouseEvent | KeyboardEvent) => void;
    onNext: (e?: React.MouseEvent | KeyboardEvent) => void;
}

const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
    open,
    onOpenChange,
    previewImage,
    allPhotos,
    onPrev,
    onNext,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === "ArrowLeft") onPrev(e);
            if (e.key === "ArrowRight") onNext(e);
            if (e.key === "Escape") onOpenChange(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onPrev, onNext, onOpenChange]);

    if (!previewImage) return null;

    const currentIndex = allPhotos.findIndex((p) => p.url === previewImage.url);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none sm:max-w-none w-screen h-screen p-0 m-0 bg-black/60 border-none shadow-none rounded-none overflow-hidden flex items-center justify-center" showCloseButton={false}>
                <DialogHeader className="sr-only">
                    <DialogTitle>{previewImage.name || "Preview Gambar"}</DialogTitle>
                </DialogHeader>
                <div className="w-screen h-screen flex items-center justify-center bg-transparent py-1 px-4 relative group/gallery" onClick={() => onOpenChange(false)}>
                    <img src={previewImage.url} alt={previewImage.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />

                    {/* Navigation Buttons */}
                    {allPhotos.length > 1 && (
                        <>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-14 w-14 transition-all border border-white/20 backdrop-blur-md z-50",
                                    currentIndex <= 0 && "opacity-20 cursor-not-allowed",
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrev(e);
                                }}
                                disabled={currentIndex <= 0}
                            >
                                <ChevronLeft size={32} />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-14 w-14 transition-all border border-white/20 backdrop-blur-md z-50",
                                    currentIndex >= allPhotos.length - 1 && "opacity-20 cursor-not-allowed",
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNext(e);
                                }}
                                disabled={currentIndex >= allPhotos.length - 1}
                            >
                                <ChevronRight size={32} />
                            </Button>
                        </>
                    )}

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="bg-white/10 text-white px-6 py-2 rounded-full text-sm font-medium backdrop-blur-xl border border-white/20 shadow-2xl">{previewImage.name}</span>
                        {allPhotos.length > 1 && (
                            <span className="text-white/60 text-xs font-light">
                                {currentIndex + 1} dari {allPhotos.length}
                            </span>
                        )}
                    </div>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 transition-all border border-white/20 backdrop-blur-md z-50"
                        onClick={() => onOpenChange(false)}
                    >
                        <X size={28} />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PhotoPreviewModal;
