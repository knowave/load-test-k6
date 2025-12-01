// k6-reporter v2.4.0 타입 선언
declare module 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js' {
    export function htmlReport(data: object, options?: object): string;
}

// k6-summary 타입 선언
declare module 'https://jslib.k6.io/k6-summary/0.0.1/index.js' {
    export function textSummary(data: object, options?: { indent?: string; enableColors?: boolean }): string;
}
