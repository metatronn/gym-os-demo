type PaymentLike = {
  amount: number;
  status: string;
  createdAt: Date | string;
};

type ClassLike = {
  time: string | null;
};

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function centsToDollars(amount: number) {
  return amount / 100;
}

export function calculatePercentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function calculateMonthlyRevenue(
  payments: PaymentLike[],
  targetMonth = new Date(),
) {
  const monthStart = startOfMonth(targetMonth);
  const nextMonthStart = addMonths(monthStart, 1);

  return payments
    .filter((payment) => {
      if (payment.status !== "succeeded") {
        return false;
      }

      const createdAt = toDate(payment.createdAt);

      return createdAt >= monthStart && createdAt < nextMonthStart;
    })
    .reduce((total, payment) => total + centsToDollars(payment.amount), 0);
}

export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  months: number,
) {
  const currentMonthStart = startOfMonth(new Date());
  const firstMonthStart = addMonths(currentMonthStart, -(months - 1));

  return Array.from({ length: months }, (_, index) => {
    const monthStart = addMonths(firstMonthStart, index);
    const nextMonthStart = addMonths(monthStart, 1);

    const revenue = payments
      .filter((payment) => {
        if (payment.status !== "succeeded") {
          return false;
        }

        const createdAt = toDate(payment.createdAt);

        return createdAt >= monthStart && createdAt < nextMonthStart;
      })
      .reduce((total, payment) => total + centsToDollars(payment.amount), 0);

    return {
      month: monthStart.toLocaleDateString("en-US", { month: "short" }),
      revenue: Number(revenue.toFixed(2)),
    };
  });
}

function parseTimeToMinutes(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [, hourValue, minuteValue, meridiem] = match;
  let hour = Number(hourValue) % 12;

  if (meridiem.toUpperCase() === "PM") {
    hour += 12;
  }

  return hour * 60 + Number(minuteValue);
}

export function sortClassesByTime<T extends ClassLike>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      parseTimeToMinutes(left.time) - parseTimeToMinutes(right.time),
  );
}
