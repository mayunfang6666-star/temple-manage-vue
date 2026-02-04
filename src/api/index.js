import request from "./request";

// Auth APIs
export function login(data) {
  return request({
    url: "/auth/login",
    method: "post",
    data,
  });
}

export function sendVerificationCode(data) {
  return request({
    url: "/auth/send-code",
    method: "post",
    data,
  });
}

export function resetPassword(data) {
  return request({
    url: "/auth/reset-password",
    method: "post",
    data,
  });
}

// Dashboard APIs
export function getDashboardStats() {
  return request({
    url: "/dashboard/stats",
    method: "get",
  });
}

export function getUpcomingRituals(limit = 5) {
  return request({
    url: "/dashboard/upcoming-rituals",
    method: "get",
    params: { limit },
  });
}

export function getMeritRanking(limit = 5) {
  return request({
    url: "/dashboard/merit-ranking",
    method: "get",
    params: { limit },
  });
}

// Monk APIs
export function getMonks(params) {
  return request({
    url: "/monks",
    method: "get",
    params,
  });
}

export function createMonk(data) {
  return request({
    url: "/monks",
    method: "post",
    data,
  });
}

export function updateMonk(id, data) {
  return request({
    url: `/monks/${id}`,
    method: "put",
    data,
  });
}

export function deleteMonk(id) {
  return request({
    url: `/monks/${id}`,
    method: "delete",
  });
}

// Ritual APIs
export function getRituals(params) {
  return request({
    url: "/rituals",
    method: "get",
    params,
  });
}

export function createRitual(data) {
  return request({
    url: "/rituals",
    method: "post",
    data,
  });
}

export function updateRitual(id, data) {
  return request({
    url: `/rituals/${id}`,
    method: "put",
    data,
  });
}

export function deleteRitual(id) {
  return request({
    url: `/rituals/${id}`,
    method: "delete",
  });
}

// Donation APIs
export function getDonations(params) {
  return request({
    url: "/donations",
    method: "get",
    params,
  });
}

export function createDonation(data) {
  return request({
    url: "/donations",
    method: "post",
    data,
  });
}

export function updateDonation(id, data) {
  return request({
    url: `/donations/${id}`,
    method: "put",
    data,
  });
}

export function deleteDonation(id) {
  return request({
    url: `/donations/${id}`,
    method: "delete",
  });
}

// Report APIs
export function getDonationReports(year) {
  return request({
    url: "/reports/donations",
    method: "get",
    params: { year },
  });
}

export function getRitualReports() {
  return request({
    url: "/reports/rituals",
    method: "get",
  });
}

export function getUserGrowthReports() {
  return request({
    url: "/reports/users",
    method: "get",
  });
}
