const total = Number(process.env.LOAD_REQUESTS ?? 1_000);
const concurrency = Number(process.env.LOAD_CONCURRENCY ?? 50);
const payload = JSON.stringify({
  hobby: "chess",
  moment: "Hold my own in the office chess night",
  level: "some",
  minutes: 60,
});
let issued = 0;
let completed = 0;
let failed = 0;
const startedAt = performance.now();

async function worker(workerId) {
  while (true) {
    const requestNumber = issued;
    if (requestNumber >= total) return;
    issued += 1;
    const response = await fetch("http://127.0.0.1:8787/api/plans", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `10.${workerId}.${Math.floor(requestNumber / 255)}.${requestNumber % 255}`,
      },
      body: payload,
    });
    if (response.ok) completed += 1;
    else failed += 1;
  }
}

await Promise.all(
  Array.from({ length: concurrency }, (_, index) => worker(index + 1)),
);
const durationSeconds = (performance.now() - startedAt) / 1_000;
console.log(
  JSON.stringify(
    {
      total,
      completed,
      failed,
      durationSeconds: Number(durationSeconds.toFixed(2)),
      requestsPerSecond: Math.round(total / durationSeconds),
      targetRequestsPerSecond: 17,
    },
    null,
    2,
  ),
);
