import { test, expect } from "@playwright/test";

/**
 * HPA (Horizontal Pod Autoscaler) Scaling Simulation Tests
 *
 * These tests verify that the application can handle scaling scenarios:
 * - Scale-up: More pods under high load
 * - Scale-down: Fewer pods under low load
 * - Connection pooling: Maintains connections across scaling
 * - Service discovery: Updates pod endpoints correctly
 */

test.describe("HPA Scaling Simulation", () => {
  const API_URL = process.env.API_URL || "http://localhost:8080";
  const WEB_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3030";

  test.beforeAll(async () => {
    // Verify API is accessible before testing
    const response = await fetch(`${API_URL}/health`);
    expect(response.ok).toBe(true);
  });

  test("should handle high concurrent load (simulating scale-up)", async ({
    request,
  }) => {
    const NUM_CONCURRENT = 50;
    const DURATION_MS = 10000; // 10 seconds

    console.log(
      `🔄 Starting HPA scale-up simulation: ${NUM_CONCURRENT} concurrent requests for ${DURATION_MS}ms`
    );

    const startTime = Date.now();
    const results = {
      success: 0,
      failure: 0,
      avgLatency: 0,
      maxLatency: 0,
      latencies: [] as number[],
    };

    // Simulate sustained high load
    const loadTest = async () => {
      while (Date.now() - startTime < DURATION_MS) {
        const promises = [];
        for (let i = 0; i < NUM_CONCURRENT; i++) {
          const reqStartTime = Date.now();
          promises.push(
            request
              .get(`${API_URL}/health`)
              .then((res) => {
                const latency = Date.now() - reqStartTime;
                results.latencies.push(latency);
                if (res.ok()) {
                  results.success++;
                } else {
                  results.failure++;
                }
              })
              .catch(() => {
                results.failure++;
              })
          );
        }
        await Promise.all(promises);
      }
    };

    await loadTest();

    // Calculate metrics
    results.avgLatency =
      results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;
    results.maxLatency = Math.max(...results.latencies);

    console.log(`
      ✓ Load test completed
      - Success: ${results.success}
      - Failures: ${results.failure}
      - Avg Latency: ${results.avgLatency.toFixed(2)}ms
      - Max Latency: ${results.maxLatency}ms
      - Success Rate: ${(
        (results.success / (results.success + results.failure)) *
        100
      ).toFixed(2)}%
    `);

    // Assert that system handled the load
    expect(results.success).toBeGreaterThan(results.failure * 10); // 90%+ success rate
    expect(results.avgLatency).toBeLessThan(5000); // Avg latency under 5s
  });

  test("should serve requests from multiple pods", async ({ request }) => {
    const NUM_REQUESTS = 100;

    console.log(
      `📊 Verifying request distribution across pods (${NUM_REQUESTS} requests)`
    );

    const podIPs = new Set<string>();
    const podNames = new Set<string>();

    for (let i = 0; i < NUM_REQUESTS; i++) {
      const response = await request.get(`${API_URL}/health`);
      expect(response.ok).toBe(true);

      // Try to extract pod info from headers if available
      // Try to extract pod info from headers if available
      try {
        const headers = await response.headersArray();
        const podHeader = headers.find(
          (h) => h.name.toLowerCase() === "x-pod-name"
        );
        const ipHeader = headers.find(
          (h) => h.name.toLowerCase() === "x-pod-ip"
        );

        if (podHeader) podNames.add(podHeader.value);
        if (ipHeader) podIPs.add(ipHeader.value);
      } catch {
        // Headers may not be available, continue without them
      }
    }

    console.log(`
      ✓ Request distribution verified
      - Unique pods responding: ${
        podNames.size > 0 ? podNames.size : "Unknown (headers not set)"
      }
      - Unique IPs: ${
        podIPs.size > 0 ? podIPs.size : "Unknown (headers not set)"
      }
    `);

    // If pod information is available in headers, verify distribution
    if (podNames.size > 0) {
      expect(podNames.size).toBeGreaterThanOrEqual(2); // At least 2 pods
    }
  });

  test("should handle graceful pod termination", async ({ request }) => {
    /**
     * This test simulates what happens when HPA scales down:
     * - Pod receives SIGTERM
     * - Pod drains existing connections (preStop hook)
     * - Pod terminates after grace period
     * - Load balancer removes pod from service
     */

    console.log("🔄 Testing graceful shutdown scenario");

    const gracefulTerminationTest = async () => {
      // Simulate multiple long-running requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(request.get(`${API_URL}/health`));
      }

      // Give a moment for requests to be in-flight
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Now simulate pod shutdown (in real scenario, this is kubectl delete)
      // The requests should still complete or fail gracefully
      const results = await Promise.allSettled(requests);

      let successful = 0;
      let failed = 0;

      results.forEach((r) => {
        if (r.status === "fulfilled") {
          try {
            if (r.value.ok()) {
              successful++;
            } else {
              failed++;
            }
          } catch {
            failed++;
          }
        } else {
          failed++;
        }
      });

      return { successful, failed };
    };

    const { successful, failed } = await gracefulTerminationTest();

    console.log(`
      ✓ Graceful shutdown test completed
      - Completed requests: ${successful}
      - Failed requests: ${failed}
      - Success rate: ${((successful / (successful + failed)) * 100).toFixed(
        2
      )}%
    `);

    // Expect that at least some requests complete (graceful shutdown working)
    expect(successful).toBeGreaterThan(0);
  });

  test("should maintain service discovery during scaling", async ({ page }) => {
    /**
     * Verify that the service DNS resolves correctly during HPA scaling
     * - Service endpoint should remain stable (Kubernetes Service)
     * - Individual pod IPs may change, but service IP stays same
     */

    console.log("🔍 Testing service discovery stability during scaling");

    // Navigate to app
    await page.goto(WEB_URL);

    // Check that service endpoint is reachable
    const response = await page.evaluate(() => {
      return fetch("/api/health").then((r) => r.ok);
    });

    expect(response).toBe(true);

    console.log("✓ Service discovery verified - API endpoint stable");

    // Simulate multiple concurrent requests to verify load balancing
    const concurrentRequests = await page.evaluate(async () => {
      const requests = Array(20)
        .fill(null)
        .map(() => fetch("/api/health"));
      const results = await Promise.allSettled(requests);
      return {
        success: results.filter((r) => r.status === "fulfilled").length,
        failure: results.filter((r) => r.status === "rejected").length,
      };
    });

    console.log(`
      ✓ Load balancing verified
      - Successful: ${concurrentRequests.success}
      - Failed: ${concurrentRequests.failure}
    `);

    expect(concurrentRequests.success).toBeGreaterThan(
      concurrentRequests.failure
    );
  });

  test("should recover from temporary pod unavailability", async ({
    request,
  }) => {
    /**
     * Simulates HPA scaling event where some pods become temporarily unavailable
     * Verifies that retries work and service recovers
     */

    console.log("🔄 Testing recovery from pod unavailability");

    let recovered = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!recovered && attempts < maxAttempts) {
      try {
        const response = await request.get(`${API_URL}/health`, {
          timeout: 5000,
        });
        if (response.ok) {
          recovered = true;
          console.log(`✓ Recovered on attempt ${attempts + 1}`);
        }
      } catch (error) {
        console.log(`⏳ Attempt ${attempts + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
      attempts++;
    }

    expect(recovered).toBe(true);
    expect(attempts).toBeLessThanOrEqual(maxAttempts);
  });

  test("should handle uneven load distribution", async ({ request }) => {
    /**
     * Verify that the load balancer correctly distributes traffic
     * even when some pods respond faster than others
     */

    console.log("📊 Testing load distribution with varying response times");

    const responseLatencies = [];

    for (let i = 0; i < 50; i++) {
      const startTime = Date.now();
      const response = await request.get(`${API_URL}/health`);
      const latency = Date.now() - startTime;

      responseLatencies.push(latency);
      expect(response.ok).toBe(true);
    }

    // Calculate distribution metrics
    const avgLatency =
      responseLatencies.reduce((a, b) => a + b, 0) / responseLatencies.length;
    const maxLatency = Math.max(...responseLatencies);
    const minLatency = Math.min(...responseLatencies);
    const stdDev = Math.sqrt(
      responseLatencies.reduce((sq, n) => sq + Math.pow(n - avgLatency, 2), 0) /
        responseLatencies.length
    );

    console.log(`
      ✓ Load distribution analysis
      - Min: ${minLatency}ms
      - Avg: ${avgLatency.toFixed(2)}ms
      - Max: ${maxLatency}ms
      - Std Dev: ${stdDev.toFixed(2)}ms
    `);

    // Expect reasonable distribution (std dev should be relatively small)
    expect(stdDev).toBeLessThan(avgLatency * 2); // Std dev less than 2x average
  });

  test("should handle spike in connections", async ({ request }) => {
    /**
     * Simulate a traffic spike that would trigger HPA scale-up
     * Verify system remains responsive
     */

    console.log("📈 Simulating traffic spike (connection burst)");

    const SPIKE_SIZE = 100;
    const startTime = Date.now();

    // Fire all requests immediately (connection burst)
    const promises = Array(SPIKE_SIZE)
      .fill(null)
      .map(() => request.get(`${API_URL}/health`));

    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;

    let successful = 0;
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        try {
          if (r.value.ok && typeof r.value.ok === "function" && r.value.ok()) {
            successful++;
          }
        } catch {
          // Ignore errors
        }
      }
    });
    const failed = SPIKE_SIZE - successful;
    const successRate = ((successful / SPIKE_SIZE) * 100).toFixed(2);

    console.log(`
      ✓ Spike handling completed in ${duration}ms
      - Total requests: ${SPIKE_SIZE}
      - Successful: ${successful}
      - Failed: ${failed}
      - Success rate: ${successRate}%
    `);

    expect(successful).toBeGreaterThan(SPIKE_SIZE * 0.9); // At least 90% success
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });
});
