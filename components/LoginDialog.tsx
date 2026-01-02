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
import { X, Loader2 } from "lucide-react"
import { FaGoogle } from "react-icons/fa6"
import { Form } from "react-hook-form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { InputGroup } from "./ui/input-group"
import Link from "next/link"
import { Separator } from "./ui/separator"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface IFormMode {
    handleChangeMode: (m: string) => void
    onClose: () => void
}

const LoginForm: React.FC<IFormMode> = ({ handleChangeMode, onClose }) => {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login gagal')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogContent className="bg-[#DBECFD] sm:max-w-[355px] px-2 pt-4" showCloseButton={false}>
            <DialogHeader className="relative flex items-center justify-center mb-3">
                <DialogTitle className="text-2xl text-center">Masuk</DialogTitle>
                <DialogClose asChild>
                    <Button size='icon' variant="ghost" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-inherit hover:border hover:border-accent-foreground">
                        <X />
                    </Button>
                </DialogClose>
            </DialogHeader>
            <form onSubmit={handleLogin}>
                <div className="px-4 flex flex-col gap-3 justify-center">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <Input
                        placeholder="Email"
                        className="bg-neutral-50"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        placeholder="Kata Sandi"
                        className="bg-neutral-50"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        className="bg-[#1378B7] hover:bg-blue-400"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : 'Masuk'}
                    </Button>
                    <p className="text-center mb-2">Lupa kata sandi? <Link href="/" className="text-[#1378B7]">Klik disini</Link></p>
                    <div className="flex justify-between mt-2 px-3">
                        <p className="text-center">Tidak punya akun?</p>
                        <span className="text-[#1378B7] cursor-pointer" onClick={() => handleChangeMode('register')}>Daftar Akun</span>
                    </div>
                    <div className="relative flex items-center my-4">
                        <Separator className="flex-1 bg-accent-foreground min-h-[1.25px]" />
                        <span className="absolute left-1/2 -translate-x-1/2 bg-[#DBECFD] px-2 text-sm uppercase font-semibold">
                            atau
                        </span>
                    </div>
                    <Button type="button" className="bg-accent text-accent-foregroun hover:bg-slate-300"> <FaGoogle /> Masuk Dengan Google</Button>
                </div>
            </form>
        </DialogContent>
    )
}

const RegisterForm: React.FC<IFormMode> = ({ handleChangeMode, onClose }) => {
    return (
        <form>
            <DialogContent className="bg-neutral-50 sm:max-w-[355px] px-2 pt-4" showCloseButton={false}>
                <DialogHeader className="relative flex items-center justify-center mb-3">
                    <DialogTitle className="text-2xl text-center">Masuk</DialogTitle>
                    <DialogClose asChild>
                        <Button size='icon' variant="ghost" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-inherit hover:border hover:border-accent-foreground">
                            <X />
                        </Button>
                    </DialogClose>
                </DialogHeader>
                <div className="px-4 flex flex-col gap-3 justify-center">
                    <Select>
                        <SelectTrigger className="w-full rounded-md border border-gray-500">
                            <SelectValue placeholder="Pilih Jenis Pengguna" />
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
                    <Input placeholder="Email" className="bg-neutral-50" />
                    <Input placeholder="Nama Pengguna" className="bg-neutral-50" />
                    <Input placeholder="Nama Organisasi" className="bg-neutral-50" />
                    <Input placeholder="Nomor Telepon" className="bg-neutral-50" />
                    <Input placeholder="Kata Sandi" className="bg-neutral-50" />
                    <Button variant="outline" className="hover:bg-[#CFF7D3] border-2">Daftar</Button>
                    <div className="flex justify-between mt-1 px-8">
                        <p className="text-center">Sudah punya akun?</p>
                        <span className="text-[#1378B7] cursor-pointer" onClick={() => handleChangeMode('login')}>Masuk Disini</span>
                    </div>
                </div>

            </DialogContent>
        </form>
    )
}

interface ILoginRegisterDialog {
    open: boolean
    setOpen: (open: boolean) => void
}

const LoginRegisterDialog: React.FC<ILoginRegisterDialog> = ({ open, setOpen }) => {
    const [mode, setMode] = useState<string>('login')

    const handleChangeMode = (m: typeof mode) => {
        setMode(m)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
            {mode === 'login' ? <LoginForm handleChangeMode={handleChangeMode} onClose={handleClose} /> : <RegisterForm handleChangeMode={handleChangeMode} onClose={handleClose} />}
        </Dialog>
    )
}

export default LoginRegisterDialog
