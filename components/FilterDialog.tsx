import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Form } from "react-hook-form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { InputGroup } from "./ui/input-group"

interface IFilterDialog {
    open: boolean
    setOpen: (open: boolean) => void
}

const FilterDialog: React.FC<IFilterDialog> = ({ open, setOpen }) => {
    return (
        <Dialog open={open}>
            <form>
                <DialogContent className="sm:max-w-[355px] px-2 pt-4" showCloseButton={false}>
                    <DialogHeader className="relative flex items-center justify-center">
                        <DialogTitle className="text-2xl text-center">Filter</DialogTitle>
                        <DialogClose asChild>
                            <Button size='icon' variant="ghost" onClick={() => setOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2">
                                <X/>
                            </Button>
                        </DialogClose>
                    </DialogHeader>
                    <div className="px-4 flex flex-col gap-3">
                        <Select>
                            <SelectTrigger className="w-full rounded-md border border-gray-500">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full rounded-md border border-gray-500">
                                <SelectValue placeholder="Sub-Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full rounded-md border border-gray-500">
                                <SelectValue placeholder="Jenis Unsur" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full rounded-md border border-gray-500">
                                <SelectValue placeholder="Status Pembakuan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full rounded-md border border-gray-500">
                                <SelectValue placeholder="Provinsi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Provinsi</SelectLabel>
                                <SelectItem value="apple">Jawa Barat</SelectItem>
                                <SelectItem value="banana">Jawa Tengah</SelectItem>
                                <SelectItem value="blueberry">Jawa Timur</SelectItem>
                                <SelectItem value="grapes">Daerah Istimewa Yogyakarta</SelectItem>
                                <SelectItem value="pineapple">Bali</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full rounded-md border border-gray-500">
                                <SelectValue placeholder="Kabupaten/Kota" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <div className="flex mt-3 justify-between"> 
                            <Button variant='outline' className="border-2">
                                Bersihkan
                            </Button>
                            <Button variant='outline' className="border-2">
                                Terapkan
                            </Button>
                        </div>
                    </div>
                    
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default FilterDialog
