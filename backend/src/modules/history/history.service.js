import { calculatePagination } from '../../../../shared/helpers/index.js';

/**
 * Service managing publishing history lists and dashboard statistics.
 * Enforces the Service Layer Pattern, utilizing PublishLogRepository via Dependency Injection.
 */
export class HistoryService {
  /**
   * @param {PublishLogRepository} logRepository
   * @param {ProjectRepository} projectRepository
   * @param {ConnectedAccountRepository} accountRepository
   */
  constructor(logRepository, projectRepository, accountRepository) {
    this.logRepository = logRepository;
    this.projectRepository = projectRepository;
    this.accountRepository = accountRepository;
  }

  /**
   * Retrieves a paginated list of publish logs for a user.
   * @param {string} userId - Owner UUID
   * @param {object} query - Query parameters (page, limit, platform, status)
   * @returns {Promise<{ logs: object[], pagination: object }>}
   */
  async getHistory(userId, query = {}) {
    const { skip, take } = calculatePagination(query.page, query.limit);

    const filter = {
      userId,
      platform: query.platform,
      status: query.status,
      skip,
      take,
    };

    const [logs, total] = await Promise.all([
      this.logRepository.findAll(filter),
      this.logRepository.count(filter),
    ]);

    const limit = take;
    const page = Math.floor(skip / limit) + 1;

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculates dashboard metrics for a user.
   * @param {string} userId - Owner UUID
   * @returns {Promise<{ totalProjects: number, publishedProjects: number, linkedinConnected: boolean, githubConnected: boolean }>}
   */
  async getDashboardStats(userId) {
    const [totalProjects, publishedProjects, connectedAccounts] = await Promise.all([
      this.projectRepository.count({ userId }),
      this.projectRepository.count({ userId, status: 'PUBLISHED' }),
      this.accountRepository.findByUserId(userId),
    ]);

    const linkedinConnected = connectedAccounts.some(
      (acc) => acc.platform === 'LINKEDIN' && acc.status === 'CONNECTED'
    );
    const githubConnected = connectedAccounts.some(
      (acc) => acc.platform === 'GITHUB' && acc.status === 'CONNECTED'
    );

    return {
      totalProjects,
      publishedProjects,
      linkedinConnected,
      githubConnected,
    };
  }
}
