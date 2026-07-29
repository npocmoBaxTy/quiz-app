import { Button } from "@/app/components/ui/button"
import { useLanguage } from "@/shared/hooks/useLanguage"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Languages } from "lucide-react"

export const LangSwitcher = () => {
    const { changeLanguage } = useLanguage()
    return (
        <div className="lang__swithcer-wrapper ml-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-(--hover-bg) text-primary hover:bg-(--main-blue) hover:text-white cursor-pointer">
                        <Languages />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-100">
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="hover:bg-(--main-blue) hover:text-white cursor-pointer" onClick={() => changeLanguage('ru')}>Русский</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-(--main-blue) hover:text-white cursor-pointer" onClick={() => changeLanguage('uz')}>Uzbek</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-(--main-blue) hover:text-white cursor-pointer" onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}