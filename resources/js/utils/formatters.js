/** Formata valor em Real brasileiro */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value ?? 0);
}

/** Formata número com casas decimais específicas */
export function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value ?? 0);
}

/** Label amigável para unidades de medida */
export const UNIT_LABELS = {
    kg:   'kg',
    g:    'g',
    l:    'L',
    ml:   'mL',
    un:   'un.',
    tbsp: 'col. sopa',
    tsp:  'col. chá',
    mg:   'mg',
};

export const UNIT_OPTIONS = Object.entries(UNIT_LABELS).map(([value, label]) => ({
    value,
    label,
}));

/** Retorna a label da unidade ou o valor bruto se não encontrado */
export function getUnitLabel(unit) {
    return UNIT_LABELS[unit] ?? unit;
}

/** Calcula custo por unidade a partir de um ingrediente */
export function calcCostPerUnit(ingredient) {
    const qty  = parseFloat(ingredient?.quantity_purchased) || 0;
    const cost = parseFloat(ingredient?.cost_purchased)     || 0;
    if (qty <= 0) return 0;
    return cost / qty;
}

/** Calcula custo de um item de ingrediente na receita */
export function calcIngredientCost(ingredient, quantityUsed) {
    const cpu = calcCostPerUnit(ingredient);
    return cpu * (parseFloat(quantityUsed) || 0);
}

/** Calcula custo total de uma lista de itens { ingredient, quantity_used } */
export function calcTotalCost(items, ingredientsMap) {
    return items.reduce((sum, item) => {
        const ing = ingredientsMap[item.ingredient_id];
        if (!ing || !item.quantity_used) return sum;
        return sum + calcIngredientCost(ing, item.quantity_used);
    }, 0);
}
