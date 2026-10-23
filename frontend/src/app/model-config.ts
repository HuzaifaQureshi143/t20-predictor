export type ModelKind = 'batting' | 'bowling';

export interface FieldSpec {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
}

export interface ModelSpec {
    kind: ModelKind;
    title: string;
    target: string;
    fields: FieldSpec[];
}
export const MODELS: ModelSpec[] = [
    {
        kind: 'batting',
        title: 'Batting',
        target: 'Runs',
        fields: [
            { key: 'balls', label: 'Balls faced', min: 1, max: 120, step: 1 },
            { key: 'fours', label: 'Fours', min: 0, max: 60, step: 1 },
            { key: 'sixes', label: 'Sixes', min: 0, max: 60, step: 1 },
            {
                key: 'strike_rate', label: 'Strike rate', min: 0, max: 720, step:
                    0.01
            },
        ],
    },
    {
        kind: 'bowling',
        title: 'Bowling',
        target: 'Runs conceded',
        fields: [
            { key: 'fours', label: 'Fours conceded', min: 0, max: 24, step: 1 },
            { key: 'sixes', label: 'Sixes conceded', min: 0, max: 24, step: 1 },
            { key: 'balls', label: 'Balls bowled', min: 1, max: 24, step: 1 },
            { key: 'economy', label: 'Economy rate', min: 0, max: 60, step: 0.01 },
        ],
    },
];