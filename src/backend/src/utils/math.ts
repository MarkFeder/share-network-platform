/**
 * Math utility functions for aggregations
 */

export function avg(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined);
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

export function sum(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined);
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) : null;
}

export function max(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined);
  return nums.length > 0 ? Math.max(...nums) : null;
}

export function min(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined);
  return nums.length > 0 ? Math.min(...nums) : null;
}

export function median(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

export function percentile(values: (number | null | undefined)[], p: number): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const index = Math.ceil((p / 100) * nums.length) - 1;
  return nums[Math.max(0, index)];
}
