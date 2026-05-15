import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { inputClass } from '../UI/Input';
import FormField from '../UI/Input';
import { UNIT_OPTIONS } from '../../utils/formatters';

const EMPTY = {
    name:               '',
    unit:               'g',
    quantity_purchased: '',
    cost_purchased:     '',
    notes:              '',
};

export default function IngredientModal({ open, onClose, ingredient = null }) {
    const isEditing = Boolean(ingredient?.id);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(
        isEditing
            ? {
                name:               ingredient.name               ?? '',
                unit:               ingredient.unit               ?? 'g',
                quantity_purchased: ingredient.quantity_purchased ?? '',
                cost_purchased:     ingredient.cost_purchased     ?? '',
                notes:              ingredient.notes              ?? '',
            }
            : { ...EMPTY }
    );

    const close = () => {
        clearErrors();
        reset();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();

        const onSuccess = () => close();

        if (isEditing) {
            put(route('ingredients.update', ingredient.id), { onSuccess });
        } else {
            post(route('ingredients.store'), { onSuccess });
        }
    };

    return (
        <Modal open={open} onClose={close} title={isEditing ? 'Editar Ingrediente' : 'Novo Ingrediente'} size="md">
            <form onSubmit={submit} className="flex flex-col gap-4">

                <FormField label="Nome" error={errors.name} required>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: Farinha de trigo"
                        autoFocus
                        className={inputClass(errors.name)}
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Unidade" error={errors.unit} required>
                        <select
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                            className={inputClass(errors.unit)}
                        >
                            {UNIT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Qtd. comprada"
                        error={errors.quantity_purchased}
                        required
                        hint="Na unidade selecionada"
                    >
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={data.quantity_purchased}
                            onChange={(e) => setData('quantity_purchased', e.target.value)}
                            placeholder="1000"
                            className={inputClass(errors.quantity_purchased)}
                        />
                    </FormField>
                </div>

                <FormField label="Custo da compra (R$)" error={errors.cost_purchased} required>
                    <div className={`flex items-center rounded-xl border bg-white transition-colors ${errors.cost_purchased ? 'border-red-400' : 'border-brown-200 focus-within:border-brown-400 focus-within:ring-2 focus-within:ring-brown-200'}`}>
                        <span className="pl-3 text-sm text-brown-400 shrink-0 select-none">R$</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.cost_purchased}
                            onChange={(e) => setData('cost_purchased', e.target.value)}
                            placeholder="0,00"
                            className="flex-1 pl-2 pr-3 py-2.5 text-sm text-brown-800 placeholder-brown-300 bg-transparent outline-none border-none focus:ring-0 min-w-0"
                        />
                    </div>
                    {errors.cost_purchased && <p className="text-xs text-red-500">{errors.cost_purchased}</p>}
                </FormField>

                <FormField label="Observações" error={errors.notes}>
                    <textarea
                        rows={2}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Opcional..."
                        className={inputClass(errors.notes)}
                    />
                </FormField>

                <div className="flex justify-end gap-3 pt-2 border-t border-cream">
                    <Button type="button" variant="ghost" onClick={close} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={processing}>
                        {isEditing ? 'Salvar' : 'Adicionar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
