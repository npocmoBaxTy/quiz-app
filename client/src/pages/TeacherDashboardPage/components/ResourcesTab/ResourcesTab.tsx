import { useState } from 'react';
import { FolderPlus, Upload, Trash2, FileText, Check, X, Layers } from 'lucide-react';
import { useStudyDocs } from './hooks/useResources.ts';
import { Header } from '@/widgets/header/header.tsx';

export default function ResourceTab() {
    const {
        categories,
        documents,
        selectedCategoryId,
        setSelectedCategoryId,
        isLoadingCategories,
        isLoadingDocuments,
        handleCreateCategory,
        handleDeleteCategory,
        handleCreateDocument,
        handleDeleteDocument,
    } = useStudyDocs();

    // Стейты для формы создания категории
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Стейты для формы создания документа
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

    // Обработчик создания категории
    const onCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await handleCreateCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsCreatingCategory(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Обработчик загрузки документа
    const onDocumentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !categoryId || !file) {
            return alert("Barcha maydonlarni to'ldiring va faylni tanlang!");
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("categoryId", categoryId);
        formData.append("file", file);

        try {
            setIsSubmittingDoc(true);
            await handleCreateDocument(formData);
            setTitle('');
            setFile(null);
            // сбрасываем инпут файла через DOM если нужно, либо оставляем
        } finally {
            setIsSubmittingDoc(false);
        }
    };


    if (isLoadingCategories || isLoadingDocuments) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-slate-400">Yuklanmoqda...</div>
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            <Header />
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Шапка */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">O'quv materiallarini boshqarish</h1>
                        <p className="text-sm text-slate-500 mt-1">Bu yerda kategoriyalar yaratishingiz va talabalar uchun fayllar yuklashingiz mumkin.</p>
                    </div>

                    {/* Кнопка создания категории */}
                    {!isCreatingCategory ? (
                        <button
                            onClick={() => setIsCreatingCategory(true)}
                            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            <FolderPlus size={18} className="text-blue-600" /> Kategoriya qo'shish
                        </button>
                    ) : (
                        <form onSubmit={onCategorySubmit} className="flex items-center gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Kategoriya nomi..."
                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
                                <Check size={18} />
                            </button>
                            <button type="button" onClick={() => setIsCreatingCategory(false)} className="bg-slate-200 text-slate-600 p-2 rounded-xl hover:bg-slate-300">
                                <X size={18} />
                            </button>
                        </form>
                    )}
                </div>

                {/* Основной контент: Сетка */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Левая колонка: Форма загрузки документа */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 h-fit">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                            <Upload className="text-blue-600" size={20} /> Yangi hujjat yuklash
                        </h2>

                        <form onSubmit={onDocumentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Hujjat nomi</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Masalan: 1-modul uchun testlar..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Kategoriyani tanlang</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="">Kategoriyani tanlang...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fayl (.pdf, .docx, .xlsx)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingDoc}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmittingDoc ? "Yuklanmoqda..." : "Faylni yuklash"}
                            </button>
                        </form>
                    </div>

                    {/* Правая колонка: Список категорий и документов (2 колонки grid) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Табы категорий */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            <button
                                onClick={() => setSelectedCategoryId(undefined)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategoryId === undefined
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Barchasi
                            </button>
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center gap-1 group">
                                    <button
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategoryId === cat.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                    {/* Кнопка удаления категории */}
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Kategoriyani o'chirish"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Список документов */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                                <Layers className="text-blue-600" size={20} /> Yuklangan materiallar ro'yxati
                            </h2>

                            {isLoadingDocuments ? (
                                <div className="text-center py-10 text-slate-400">Yuklanmoqda...</div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                    Hozircha hujjatlar mavjud emas.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-4 bg-slate-50/70 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-sm">{doc.title}</h3>
                                                    <span className="text-xs text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md font-medium">
                                                        {doc.category?.name || "Kategoriyasiz"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={"http://localhost:5000" + doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
                                                >
                                                    Ochish
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                                    title="O'chirish"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div >
        </main>

    );
}