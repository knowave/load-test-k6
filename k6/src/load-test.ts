import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import { Options } from 'k6/options';

// Custom Metrics
const healthCheckDuration = new Trend('health_check_duration');
const cpuIntensiveDuration = new Trend('cpu_intensive_duration');
const memoryIntensiveDuration = new Trend('memory_intensive_duration');
const ioDelayDuration = new Trend('io_delay_duration');
const payloadDuration = new Trend('payload_duration');
const errorRate = new Rate('errors');
const requestCount = new Counter('total_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const options: Options = {
    stages: [
        { duration: '10s', target: 5 }, // Ramp-up: 10초 동안 5명까지 증가
        { duration: '30s', target: 10 }, // Peak: 30초 동안 최대 10명 유지
        { duration: '10s', target: 0 }, // Ramp-down: 10초 동안 0명으로 감소
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% 요청이 2초 이내
        errors: ['rate<0.1'], // 에러율 10% 미만
    },
};

export const scenarios = {
    load_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '10s', target: 5 },
            { duration: '30s', target: 10 },
            { duration: '10s', target: 0 },
        ],
    },
};

// Health Check 테스트
function testHealthCheck(): void {
    const response = http.get(`${BASE_URL}/api/health`);

    healthCheckDuration.add(response.timings.duration);
    requestCount.add(1);

    const success = check(response, {
        'health: status is 200': (r) => r.status === 200,
        'health: response has status ok': (r) => {
            const body = r.json() as { status?: string };
            return body?.status === 'ok';
        },
    });

    errorRate.add(!success);
}

// CPU 집약적 작업 테스트
function testCpuIntensive(): void {
    const n = Math.floor(Math.random() * 10) + 30;
    const response = http.get(`${BASE_URL}/api/cpu-intensive?n=${n}`);

    cpuIntensiveDuration.add(response.timings.duration);
    requestCount.add(1);

    const success = check(response, {
        'cpu: status is 200': (r) => r.status === 200,
        'cpu: has result': (r) => {
            const body = r.json() as { result?: number };
            return body?.result !== undefined;
        },
    });

    errorRate.add(!success);
}

// 메모리 집약적 작업 테스트
function testMemoryIntensive(): void {
    const sizes = [10000, 50000, 100000];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const response = http.get(`${BASE_URL}/api/memory-intensive?size=${size}`);

    memoryIntensiveDuration.add(response.timings.duration);
    requestCount.add(1);

    const success = check(response, {
        'memory: status is 200': (r) => r.status === 200,
        'memory: has arraySize': (r) => {
            const body = r.json() as { arraySize?: number };
            return body?.arraySize !== undefined;
        },
    });

    errorRate.add(!success);
}

// I/O 지연 테스트
function testIoDelay(): void {
    const delays = [50, 100, 200];
    const delay = delays[Math.floor(Math.random() * delays.length)];
    const response = http.get(`${BASE_URL}/api/io-delay?delay=${delay}`);

    ioDelayDuration.add(response.timings.duration);
    requestCount.add(1);

    const success = check(response, {
        'io: status is 200': (r) => r.status === 200,
        'io: actual delay >= requested': (r) => {
            const body = r.json() as { actualDurationMs?: number; requestedDelay?: number };
            return (body?.actualDurationMs ?? 0) >= (body?.requestedDelay ?? 0);
        },
    });

    errorRate.add(!success);
}

// Echo POST 테스트
function testEcho(): void {
    const payload = JSON.stringify({
        userId: Math.floor(Math.random() * 1000),
        action: 'load-test',
        timestamp: Date.now(),
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(`${BASE_URL}/api/echo`, payload, params);

    requestCount.add(1);

    const success = check(response, {
        'echo: status is 200': (r) => r.status === 200,
        'echo: body echoed': (r) => {
            const body = r.json() as { body?: { action?: string } };
            return body?.body?.action === 'load-test';
        },
    });

    errorRate.add(!success);
}

// 가변 페이로드 테스트
function testVariablePayload(): void {
    const sizes = ['small', 'medium', 'large'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const response = http.get(`${BASE_URL}/api/payload/${size}`);

    payloadDuration.add(response.timings.duration);
    requestCount.add(1);

    const success = check(response, {
        'payload: status is 200': (r) => r.status === 200,
        'payload: has data array': (r) => {
            const body = r.json() as { data?: unknown[] };
            return Array.isArray(body?.data);
        },
    });

    errorRate.add(!success);
}

/**
 * 메인 테스트 함수
 */
export default function (): void {
    // 각 VU(Virtual User)가 모든 엔드포인트를 순차적으로 테스트
    testHealthCheck();
    sleep(0.5);

    testCpuIntensive();
    sleep(0.5);

    testMemoryIntensive();
    sleep(0.5);

    testIoDelay();
    sleep(0.5);

    testEcho();
    sleep(0.5);

    testVariablePayload();
    sleep(0.5);
}

/**
 * 테스트 시작 전 실행
 */
export function setup(): { startTime: number } {
    console.log('🚀 Load Test Started');
    console.log(`📍 Target: ${BASE_URL}`);
    console.log('👥 Max VUs: 10');

    // 서버 헬스체크
    const response = http.get(`${BASE_URL}/api/health`);
    if (response.status !== 200) {
        throw new Error(`Server is not healthy! Status: ${response.status}`);
    }

    return { startTime: Date.now() };
}

// 테스트 종료 후 실행
export function teardown(data: { startTime: number }): void {
    const duration = (Date.now() - data.startTime) / 1000;
    console.log(`\n✅ Load Test Completed in ${duration.toFixed(2)}s`);
}

// 테스트 결과 요약 - HTML 리포트 생성
export function handleSummary(data: object): Record<string, string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return {
        [`results/report-${timestamp}.html`]: htmlReport(data),
        [`results/summary-${timestamp}.json`]: JSON.stringify(data, null, 2),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}
