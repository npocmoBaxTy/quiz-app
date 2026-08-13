import { NavLink } from "react-router-dom"

export const Logo = () => {
    return (
        <div className="flex items-center gap-3">
            <NavLink to={'/'} className="flex items-center gap-2" >
                <div className="bg-(--main-blue) rounded-lg flex items-center justify-center text-white ">
                    <div className="w-9 h-9 shadow-xl text-xl bg-[#ff8600] rounded-lg flex items-center justify-center text-white font-bold">S</div>
                </div>
                <span className="text-2xl font-medium tracking-tight text-slate-700 hidden md:block">
                    SP<span className="text-(--primary-blue) font-medium">EB</span>
                </span>
            </NavLink>
        </div>
    )
}