# Variables — M1c-1

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "neon_api_key" {
  description = "Neon organization API key"
  type        = string
  sensitive   = true
}

variable "neon_project_id" {
  description = "Existing Neon project ID to import"
  type        = string
}

variable "vercel_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team/org ID (optional)"
  type        = string
  default     = ""
}

variable "sentry_token" {
  description = "Sentry auth token"
  type        = string
  sensitive   = true
}

variable "sentry_organization" {
  description = "Sentry organization slug"
  type        = string
  default     = "srf-portal"
}

variable "github_repository" {
  description = "GitHub repository (org/repo format)"
  type        = string
  default     = "rana/yogananda-teachings"
}

variable "domain" {
  description = "Production domain"
  type        = string
  default     = "teachings.yogananda.org"
}
