import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChefHat, Plus, AlertCircle } from 'lucide-react';
import PageHeader from '../../Components/UI/PageHeader';
import Button from '../../Components/UI/Button';
import SearchInput from '../../Components/UI/SearchInput';
import EmptyState from '../../Components/UI/EmptyState';
import Modal from '../../Components/UI/Modal';
import RecipeCard from '../../Components/Recipes/RecipeCard';

export default function RecipesIndex({ recipes }) {
    const [search,       setSearch]       = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting,     setDeleting]     = useState(false);

    const filtered = search.trim()
        ? recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
        : recipes;

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('recipes.destroy', deleteTarget.id), {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <>
            <PageHeader
                title="Receitas"
                subtitle={`${recipes.length} receita${recipes.length !== 1 ? 's' : ''} cadastrada${recipes.length !== 1 ? 's' : ''}`}
                action={
                    <Button icon={Plus} as={Link} href={route('recipes.create')}>
                        Nova Receita
                    </Button>
                }
            />

            <div className="mb-5">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Pesquisar receitas..."
                    className="max-w-xs"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-cream-200 shadow-sm">
                    <EmptyState
                        icon={ChefHat}
                        title={search ? 'Nenhuma receita encontrada' : 'Nenhuma receita ainda'}
                        description={search ? 'Tente outro termo.' : 'Crie sua primeira receita para calcular custos.'}
                        action={
                            !search && (
                                <Button icon={Plus} size="sm" onClick={() => router.visit(route('recipes.create'))}>
                                    Criar Receita
                                </Button>
                            )
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onDelete={setDeleteTarget}
                        />
                    ))}
                </div>
            )}

            <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir Receita" size="sm">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 items-start p-4 bg-red-50 rounded-xl">
                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                            Excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
                        <Button variant="danger" loading={deleting} onClick={confirmDelete}>Excluir</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
