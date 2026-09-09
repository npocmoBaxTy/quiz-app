import { useState, useMemo } from 'react';
import { Search, FileText, Download, ExternalLink, Layers, BookOpen } from 'lucide-react';
import { useStudyDocs } from './hooks/useResources';
import { Header } from '@/widgets/header/header';
import { Sidebar } from '@/app/components/ui/sidebar';

export default function StudentStudyView() {
    const {
        categories,
        documents,
        selectedCategoryId,
        setSelectedCategoryId,
        isLoadingCategories,
        isLoadingDocuments,
    } = useStudyDocs();

    // Локальный поиск по названию документа среди уже загруженных
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDocuments = useMemo(() => {
        if (!searchQuery.trim()) return documents;
        return documents.filter((doc) =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
    }, [documents, searchQuery]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-64">
                <Header />

                <div className="w-full p-6 space-y-8">
                    {/* Шапка страницы */}
                    <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                                Talaba uchun
                            </span>
                            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                                O'quv materiallari va resurslar
                            </h1>
                            <p className="text-blue-100 mt-2 text-sm md:text-base opacity-90">
                                Darsliklar, testlar, taqdimotlar va o'quv qo'llanmalarini shu yerdan topishingiz va yuklab olishingiz mumkin.
                            </p>
                        </div>
                        <div className="absolute -right-5 -bottom-10 opacity-10 pointer-events-none">
                            <BookOpen size={240} />
                        </div>
                    </div>

                    {/* Панель фильтров: Поиск + Табы категорий */}
                    <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">

                        {/* Поиск */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Hujjat nomi bo'yicha qidirish..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* Табы категорий */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
                            <button
                                onClick={() => setSelectedCategoryId(undefined)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategoryId === undefined
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                Barchasi
                            </button>

                            {isLoadingCategories ? (
                                <span className="text-xs text-slate-400 px-3">Kategoriyalar yuklanmoqda...</span>
                            ) : (
                                categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategoryId === cat.id
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Сетка/Список документов */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Layers className="text-blue-600" size={20} /> Materiallar ro'yxati
                            </h2>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                                Jami: {filteredDocuments.length} ta
                            </span>
                        </div>

                        {isLoadingDocuments ? (
                            <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
                                Yuklanmoqda...
                            </div>
                        ) : filteredDocuments.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
                                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                                    <FileText size={24} />
                                </div>
                                <p className="text-slate-600 font-medium">Hujjatlar topilmadi</p>
                                <p className="text-xs text-slate-400">Qidiruv so'zini o'zgartirib ko'ring yoki boshqa kategoriyani tanlang.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredDocuments.map((doc) => {
                                    // Формируем правильную ссылку на бэкенд (если не используете прокси в Vite)
                                    const fileUrl = doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`;

                                    return (
                                        <div
                                            key={doc.id}
                                            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                        {doc.category?.name || "Umumiy"}
                                                    </span>
                                                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400">
                                                        Qo'shilgan vaqti: {new Date(doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Кнопки действий (Открыть / Скачать) */}
                                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200/60"
                                                >
                                                    <ExternalLink size={14} /> Ochish
                                                </a>
                                                <a
                                                    href={fileUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                                                >
                                                    <Download size={14} /> Yuklab olish
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>

    );
}