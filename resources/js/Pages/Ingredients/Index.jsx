import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Package, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../Components/UI/PageHeader';
import Button from '../../Components/UI/Button';
import SearchInput from '../../Components/UI/SearchInput';
import Card from '../../Components/UI/Card';
import Badge from '../../Components/UI/Badge';
import EmptyState from '../../Components/UI/EmptyState';
import Modal from '../../Components/UI/Modal';
import IngredientModal from '../../Components/Ingredients/IngredientModal';
import { formatCurrency, formatNumber, getUnitLabel } from '../../utils/formatters';

export default function IngredientsIndex({ ingredients }) {
    const [search,        setSearch]        = useState('');
    const [modalOpen,     setModalOpen]     = useState(false);
    const [editTarget,    setEditTarget]    = useState(null);
    const [deleteTarget,  setDeleteTarget]  = useState(null);
    const [deleting,      setDeleting]      = useState(false);

    const filtered = useMemo(() => {
        if (!search.trim()) return ingredients;
        const q = search.toLowerCase();
        return ingredients.filter((i) =>
            i.name.toLowerCase().includes(q) || i.unit.toLowerCase().includes(q)
        );
    }, [search, ingredients]);

    const openCreate = () => { setEditTarget(null); setModalOpen(true); };
    const openEdit   = (ing) => { setEditTarget(ing); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('ingredients.destroy', deleteTarget.id), {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <>
            <PageHeader
                title="Ingredientes"
                subtitle={`${ingredients.length} ingrediente${ingredients.length !== 1 ? 's' : ''} cadastrado${ingredients.length !== 1 ? 's' : ''}`}
                action={
                    <Button icon={Plus} onClick={openCreate}>
                        Novo Ingrediente
                    </Button>
                }
            />

            {/* Search + Table */}
            <Card padding={false}>
                <div className="p-4 border-b border-cream-200">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Pesquisar ingredientes..."
                        className="max-w-xs"
                    />
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title={search ? 'Nenhum resultado encontrado' : 'Nenhum ingrediente ainda'}
                        description={search ? 'Tente outro termo de pesquisa.' : 'Adicione seu primeiro ingrediente para começar.'}
                        action={
                            !search && (
                                <Button icon={Plus} onClick={openCreate} size="sm">
                                    Adicionar Ingrediente
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-cream-200 text-xs uppercase text-brown-400 tracking-wide">
                                        <th className="text-left px-5 py-3 font-medium">Nome</th>
                                        <th className="text-left px-5 py-3 font-medium">Unidade</th>
                                        <th className="text-right px-5 py-3 font-medium">Qtd. comprada</th>
                                        <th className="text-right px-5 py-3 font-medium">Custo compra</th>
                                        <th className="text-right px-5 py-3 font-medium">Custo / unidade</th>
                                        <th className="text-center px-5 py-3 font-medium">Em uso</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filtered.map((ing) => (
                                            <motion.tr
                                                key={ing.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-cream/60 hover:bg-cream-50/50 transition-colors"
                                            >
                                                <td className="px-5 py-3.5 font-medium text-brown-700">{ing.name}</td>
                                                <td className="px-5 py-3.5 text-brown-500">{getUnitLabel(ing.unit)}</td>
                                                <td className="px-5 py-3.5 text-right text-brown-600">
                                                    {formatNumber(ing.quantity_purchased, 3)}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-brown-600">
                                                    {formatCurrency(ing.cost_purchased)}
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-medium text-brown-700">
                                                    {formatCurrency(ing.cost_per_unit)}/{getUnitLabel(ing.unit)}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    {ing.in_use ? (
                                                        <Badge variant="success">Sim</Badge>
                                                    ) : (
                                                        <Badge variant="default">Não</Badge>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openEdit(ing)}
                                                            className="p-1.5 rounded-lg text-brown-400 hover:bg-cream hover:text-brown-600 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(ing)}
                                                            disabled={ing.in_use}
                                                            className="p-1.5 rounded-lg text-brown-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title={ing.in_use ? 'Em uso em receitas' : 'Excluir'}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-cream/60">
                            {filtered.map((ing) => (
                                <div key={ing.id} className="p-4 flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-brown-700 truncate">{ing.name}</span>
                                            {ing.in_use && <Badge variant="success">Em uso</Badge>}
                                        </div>
                                        <p className="text-xs text-brown-400">
                                            {formatNumber(ing.quantity_purchased, 3)} {getUnitLabel(ing.unit)}
                                            &nbsp;·&nbsp;
                                            {formatCurrency(ing.cost_purchased)}
                                        </p>
                                        <p className="text-xs font-medium text-brown-600 mt-0.5">
                                            {formatCurrency(ing.cost_per_unit)} / {getUnitLabel(ing.unit)}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => openEdit(ing)}
                                            className="p-1.5 rounded-lg text-brown-400 hover:bg-cream hover:text-brown-600 transition-colors"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(ing)}
                                            disabled={ing.in_use}
                                            className="p-1.5 rounded-lg text-brown-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Create / Edit modal */}
            <IngredientModal
                open={modalOpen}
                onClose={closeModal}
                ingredient={editTarget}
            />

            {/* Delete confirmation modal */}
            <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir Ingrediente" size="sm">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 items-start p-4 bg-red-50 rounded-xl">
                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                            Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Cancelar
                        </Button>
                        <Button variant="danger" loading={deleting} onClick={confirmDelete}>
                            Excluir
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
