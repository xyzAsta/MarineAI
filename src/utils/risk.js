export const RISK_METHODOLOGY = 'Demo prioritization heuristic for front-end planning. It combines observed extent, condition, habitat sensitivity, shoreline importance, and persistence. This is not a scientific validation and should be replaced or calibrated before deployment.';
export function clampRange(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(Math.max(value, min), max);
}
export function getRiskSeverity(score) {
    if (score >= 90) {
        return 'Critical';
    }
    if (score >= 70) {
        return 'High';
    }
    if (score >= 40) {
        return 'Moderate';
    }
    return 'Low';
}
export function conditionToScore(condition) {
    switch (condition) {
        case 'Intact':
            return 25;
        case 'Weathered':
            return 50;
        case 'Damaged':
            return 68;
        case 'Fragmented':
            return 82;
        default:
            return 0;
    }
}
export function calculateIllustrativeRisk(inputs) {
    const normalized = {
        debrisQuantity: clampRange(inputs.debrisQuantity ?? 0, 0, 100),
        condition: clampRange(inputs.condition ?? 0, 0, 100),
        habitat: clampRange(inputs.habitat ?? 0, 0, 100),
        shoreline: clampRange(inputs.shoreline ?? 0, 0, 100),
        persistence: clampRange(inputs.persistence ?? 0, 0, 100),
    };
    const factors = [
        {
            name: 'Debris quantity',
            weight: 0.28,
            value: normalized.debrisQuantity,
            normalized: normalized.debrisQuantity,
            description: 'The observed extent of debris on-site and the likely volume requiring cleanup.',
        },
        {
            name: 'Condition',
            weight: 0.22,
            value: normalized.condition,
            normalized: normalized.condition,
            description: 'Condition reflects fragmentation and weathering to estimate persistence and handling difficulty.',
        },
        {
            name: 'Habitat sensitivity',
            weight: 0.22,
            value: normalized.habitat,
            normalized: normalized.habitat,
            description: 'Proximity to mangroves, wetlands, or other ecologically sensitive habitats increases urgency.',
        },
        {
            name: 'Shoreline exposure',
            weight: 0.18,
            value: normalized.shoreline,
            normalized: normalized.shoreline,
            description: 'High-use or ecologically important shoreline exposure raises priority for intervention.',
        },
        {
            name: 'Persistence',
            weight: 0.1,
            value: normalized.persistence,
            normalized: normalized.persistence,
            description: 'Repeated observations or slow removal suggest a persistent pollution problem.',
        },
    ];
    const score = Math.round(factors.reduce((total, factor) => total + factor.value * factor.weight, 0));
    const severity = getRiskSeverity(score);
    const changedScores = factors
        .map((factor) => `${factor.name}: ${factor.value}`)
        .join(', ');
    const explanation = `The adjusted score is based on ${changedScores}. This demo heuristic intentionally keeps environmental exposure and persistence visible rather than treating condition alone as the deciding factor.`;
    return {
        score,
        severity,
        factors,
        explanation,
    };
}
