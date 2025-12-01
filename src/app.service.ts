export interface CpuIntensiveResult {
    result: number;
    input: number;
    durationMs: number;
}

export interface MemoryIntensiveResult {
    arraySize: number;
    sum: string;
    durationMs: number;
}

export interface IoDelayResult {
    requestedDelay: number;
    actualDurationMs: number;
}

export interface EchoResult {
    receivedAt: number;
    body: unknown;
    headers: {
        contentType: string | undefined;
        userAgent: string | undefined;
    };
}

export interface PayloadItem {
    id: number;
    name: string;
    value: number;
}

export interface VariablePayloadResult {
    size: string;
    itemCount: number;
    data: PayloadItem[];
}

export interface HealthCheckResult {
    status: string;
    timestamp: number;
}

export default class AppService {
    /**
     * 헬스체크
     */
    public healthCheck(): HealthCheckResult {
        return {
            status: 'ok',
            timestamp: Date.now(),
        };
    }

    /**
     * CPU 집약적 작업 - 피보나치 계산
     */
    public cpuIntensive(n: number): CpuIntensiveResult {
        const limitedN = Math.min(n, 45);
        const startTime = Date.now();

        const result = this.fibonacci(limitedN);
        const duration = Date.now() - startTime;

        return {
            result,
            input: n,
            durationMs: duration,
        };
    }

    private fibonacci(num: number): number {
        if (num <= 1) return num;
        return this.fibonacci(num - 1) + this.fibonacci(num - 2);
    }

    /**
     * 메모리 집약적 작업 - 대용량 배열 생성
     */
    public memoryIntensive(size: number): MemoryIntensiveResult {
        const limitedSize = Math.min(size, 10000000);
        const startTime = Date.now();

        const arr = Array.from({ length: limitedSize }, (_, i) => ({
            id: i,
            value: Math.random(),
            data: `item-${i}`,
        }));

        const sum = arr.reduce((acc, item) => acc + item.value, 0);
        const duration = Date.now() - startTime;

        return {
            arraySize: limitedSize,
            sum: sum.toFixed(2),
            durationMs: duration,
        };
    }

    /**
     * I/O 지연 시뮬레이션
     */
    public async ioDelay(delay: number): Promise<IoDelayResult> {
        const limitedDelay = Math.min(delay, 10000);
        const startTime = Date.now();

        await new Promise((resolve) => setTimeout(resolve, limitedDelay));

        const duration = Date.now() - startTime;

        return {
            requestedDelay: limitedDelay,
            actualDurationMs: duration,
        };
    }

    /**
     * Echo - 요청 데이터 반환
     */
    public echo(body: unknown, contentType: string | undefined, userAgent: string | undefined): EchoResult {
        return {
            receivedAt: Date.now(),
            body,
            headers: {
                contentType,
                userAgent,
            },
        };
    }

    /**
     * 가변 페이로드 생성
     */
    public variablePayload(size: string): VariablePayloadResult {
        const payloadSizes: Record<string, number> = {
            small: 100,
            medium: 1000,
            large: 10000,
            xlarge: 100000,
        };

        const itemCount = payloadSizes[size] ?? payloadSizes['small']!;

        const data = Array.from({ length: itemCount }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random(),
        }));

        return {
            size,
            itemCount,
            data,
        };
    }
}
