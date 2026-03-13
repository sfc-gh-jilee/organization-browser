/**
 * Synthetic data generator for Organization Browser prototype.
 * Produces ~100 accounts, ~25 user groups, ~2000 users.
 */

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + rand() * (end - start));
  return d.toISOString().split('T')[0];
}

function randomLocator(region) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let loc = '';
  for (let i = 0; i < 7; i++) loc += chars[Math.floor(rand() * chars.length)];
  const regionSlug = region.toLowerCase().replace(/\s+/g, '-');
  return `${loc}.${regionSlug}`;
}

// --- Account generation ---

const COMPANY_PREFIXES = [
  'GLOBAL', 'ACME', 'NORTHAM', 'WESTERN', 'EASTERN', 'CENTRAL', 'PACIFIC',
  'ATLANTIC', 'ALPINE', 'SUMMIT', 'PINNACLE', 'TITAN', 'APEX', 'NOVA',
  'VERTEX', 'QUANTUM', 'NEXUS', 'PRIME', 'STELLAR', 'HORIZON', 'VANGUARD',
  'LEGACY', 'FRONTIER', 'KEYSTONE', 'BEACON', 'RADIANT', 'ONYX', 'COBALT',
  'EMERALD', 'SAPPHIRE',
];

const COMPANY_DOMAINS = [
  'RETAIL', 'FINANCE', 'MARKETING', 'SALES', 'ANALYTICS', 'ENGINEERING',
  'RESEARCH', 'HEALTHCARE', 'INSURANCE', 'LOGISTICS', 'MEDIA', 'TELECOM',
  'ENERGY', 'PHARMA', 'MANUFACTURING', 'SUPPLY_CHAIN', 'COMPLIANCE',
  'SECURITY', 'DATA_SCIENCE', 'AI_ML',
];

const COMPANY_SUFFIXES = [
  'DATA', 'CLOUD', 'TERRITORY', 'HUB', 'PLATFORM', 'SYSTEMS', 'NETWORK',
  'SERVICES', 'GROUP', 'CORE',
];

const EDITIONS = ['Standard', 'Enterprise', 'Business Critical'];
const CLOUDS = ['AWS', 'Azure', 'GCP'];
const REGIONS_BY_CLOUD = {
  AWS: ['US-East-1', 'US-East-2', 'US-West-2', 'EU-West-1', 'EU-Central-1', 'AP-Southeast-1', 'AP-Northeast-1', 'CA-Central-1', 'SA-East-1'],
  Azure: ['East US', 'East US 2', 'West US 2', 'West Europe', 'North Europe', 'Southeast Asia', 'Australia East', 'Canada Central', 'Japan East'],
  GCP: ['US-Central1', 'US-East4', 'Europe-West1', 'Europe-West4', 'Asia-East1', 'Asia-Northeast1', 'Australia-Southeast1'],
};

function generateAccounts(count) {
  const accounts = [];
  const usedNames = new Set();
  for (let i = 0; i < count; i++) {
    let name;
    do {
      name = `${pick(COMPANY_PREFIXES)}_${pick(COMPANY_DOMAINS)}_${pick(COMPANY_SUFFIXES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const cloud = pick(CLOUDS);
    const region = pick(REGIONS_BY_CLOUD[cloud]);
    accounts.push({
      id: `acc-${i}`,
      name,
      edition: pick(EDITIONS),
      cloud,
      region,
      created: randomDate(2018, 2025),
      locator: randomLocator(region),
      tenantType: rand() < 0.2 ? 'External' : 'Internal',
    });
  }
  return accounts.sort((a, b) => a.name.localeCompare(b.name));
}

// --- User Group generation ---

const GROUP_PREFIXES = [
  'FINANCE', 'EMEA', 'PROJECT', 'PLATFORM', 'DATA_SCIENCE', 'COMPLIANCE',
  'SECURITY', 'MARKETING', 'SALES', 'ENGINEERING', 'DEVOPS', 'QA',
  'SUPPORT', 'EXECUTIVE', 'HR', 'LEGAL', 'PRODUCT', 'DESIGN', 'RESEARCH',
  'OPERATIONS', 'ANALYTICS', 'INFRASTRUCTURE', 'GOVERNANCE', 'RISK',
  'AUDIT', 'CLOUD_OPS', 'ML_ENGINEERING', 'DATA_ENGINEERING',
];

const GROUP_SUFFIXES = [
  'ANALYSTS', 'ADMINS', 'CONTRIBUTORS', 'ENGINEERS', 'AUDITORS',
  'MANAGERS', 'OWNERS', 'VIEWERS', 'OPERATORS', 'LEADS', 'TEAM',
  'REVIEWERS', 'APPROVERS',
];

const GROUP_COMMENTS = [
  'Primary team for data analysis and reporting',
  'Administrative access for region management',
  'Contributors to cross-functional projects',
  'Platform engineering and infrastructure team',
  'Compliance monitoring and audit support',
  'Security operations and incident response',
  'Marketing analytics and campaign management',
  'Sales operations and CRM data access',
  'Core engineering team members',
  'DevOps and CI/CD pipeline management',
  'Quality assurance and testing team',
  'Customer support and escalation team',
  'Executive leadership data access',
  'Human resources data management',
  'Legal and regulatory compliance',
  'Product management and roadmap planning',
  'Design systems and UX research',
  'Research and development team',
  'Operations management and monitoring',
  'Business intelligence and dashboards',
  'Cloud infrastructure management',
  'Data governance and stewardship',
  'Risk assessment and modeling team',
  'Internal audit and controls team',
  'Machine learning model development',
];

function generateUserGroups(count) {
  const groups = [];
  const usedNames = new Set();
  for (let i = 0; i < count; i++) {
    let name;
    do {
      name = `${pick(GROUP_PREFIXES)}_${pick(GROUP_SUFFIXES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    groups.push({
      id: `grp-${i}`,
      name,
      comment: GROUP_COMMENTS[i % GROUP_COMMENTS.length],
      userCount: Math.floor(rand() * 400) + 10,
      accountCount: Math.floor(rand() * 8) + 1,
      owner: pick(['GLOBALORGADMIN', 'SECURITYADMIN', 'USERADMIN']),
      created: randomDate(2019, 2025),
    });
  }
  return groups.sort((a, b) => a.name.localeCompare(b.name));
}

// --- User generation ---

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
  'Frank', 'Rachel', 'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine',
  'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Ruth',
  'Jose', 'Julie', 'Adam', 'Olivia', 'Nathan', 'Joyce', 'Henry', 'Virginia',
  'Ethan', 'Victoria', 'Douglas', 'Kelly', 'Peter', 'Lauren', 'Zachary', 'Christina',
  'Kyle', 'Joan', 'Noah', 'Evelyn', 'Harold', 'Judith', 'Carl', 'Megan',
  'Arthur', 'Andrea', 'Gerald', 'Cheryl', 'Roger', 'Hannah', 'Keith', 'Jacqueline',
  'Lawrence', 'Martha', 'Terry', 'Gloria', 'Sean', 'Teresa', 'Albert', 'Ann',
  'Austin', 'Sara', 'Jesse', 'Madison', 'Wayne', 'Frances', 'Christian', 'Kathryn',
  'Dylan', 'Janice', 'Russell', 'Jean', 'Louis', 'Abigail', 'Philip', 'Alice',
  'Roy', 'Judy', 'Eugene', 'Sophia', 'Randy', 'Grace', 'Vincent', 'Denise',
  'Bobby', 'Amber', 'Harry', 'Doris', 'Johnny', 'Marilyn', 'Bruce', 'Danielle',
  'Gabriel', 'Beverly', 'Joe', 'Isabella', 'Logan', 'Theresa', 'Alan', 'Diana',
  'Ralph', 'Natalie', 'Billy', 'Brittany', 'Howard', 'Charlotte', 'Clarence', 'Marie',
  'Jordan', 'Kayla', 'Victor', 'Alexis', 'Russell', 'Lori',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans',
  'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart',
  'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
  'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim',
  'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James',
  'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo',
  'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell',
  'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson',
  'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons', 'Griffin', 'Aguilar',
  'Black', 'Fox', 'Stone', 'Freeman', 'Palmer', 'Hart', 'Keller', 'Webb', 'Olson',
  'Knight', 'Dunn', 'Snyder', 'Hunt', 'Hicks', 'Holmes', 'Palmer',
];

const ROLE_SUFFIXES = [
  'SUPPORT', 'ADMIN', 'ANALYST', 'ENGINEER', 'MANAGER', 'DEV', 'OPS',
  'DATA', 'SECURITY', 'LEAD', 'ARCHITECT', 'CONSULTANT', 'SPECIALIST',
  'COORDINATOR', 'DIRECTOR', 'VP', 'SRE', 'DBA', 'INTERN', 'CONTRACTOR',
];

const SERVICE_PREFIXES = [
  'SVC', 'BOT', 'PIPELINE', 'ETL', 'SYNC', 'MONITOR', 'SCHEDULER',
  'LOADER', 'EXPORTER', 'CONNECTOR', 'WEBHOOK', 'API', 'AGENT',
];

const SERVICE_NAMES = [
  'DATA_LOADER', 'ETL_PIPELINE', 'SYNC_SERVICE', 'MONITORING_AGENT',
  'SCHEDULER_BOT', 'EXPORT_SERVICE', 'API_CONNECTOR', 'WEBHOOK_HANDLER',
  'LOG_COLLECTOR', 'METRIC_AGGREGATOR', 'BACKUP_SERVICE', 'REPLICATION_AGENT',
  'NOTIFICATION_SERVICE', 'AUDIT_LOGGER', 'CACHE_MANAGER',
];

const AUTH_METHODS = ['Password', 'SSO', 'Key Pair', 'OAuth'];

function generateUsers(count) {
  const users = [];
  const usedNames = new Set();
  const serviceRatio = 0.12;

  for (let i = 0; i < count; i++) {
    const isService = rand() < serviceRatio;
    let name, displayName, authMethod;

    if (isService) {
      const svcName = pick(SERVICE_NAMES);
      const suffix = Math.floor(rand() * 100);
      name = `${pick(SERVICE_PREFIXES)}_${svcName}_${suffix}`;
      if (usedNames.has(name)) name += `_${i}`;
      displayName = name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      authMethod = pick(['Key Pair', 'OAuth']);
    } else {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const role = pick(ROLE_SUFFIXES);
      name = `${first.toUpperCase()}_${last.toUpperCase()}_${role}`;
      if (usedNames.has(name)) name += `_${i}`;
      displayName = `${first} ${last}`;
      authMethod = pick(AUTH_METHODS);
    }

    usedNames.add(name);

    const emailName = isService
      ? name.toLowerCase().replace(/_/g, '.')
      : `${displayName.split(' ')[0].toLowerCase()}.${displayName.split(' ')[1]?.toLowerCase() || 'user'}`;
    const emailDomain = pick(['@lseg.c.com', '@company.com', '@snowflake.com', '@analytics.io']);
    const owners = ['GLOBALORGADMIN', 'SECURITYADMIN', 'USERADMIN', 'SYSADMIN', 'ACCOUNTADMIN'];
    const statuses = ['Enabled', 'Enabled', 'Enabled', 'Enabled', 'Disabled'];

    users.push({
      id: `usr-${i}`,
      name,
      displayName,
      email: emailName + emailDomain,
      authMethod,
      mfaEnabled: !isService && rand() > 0.3,
      userType: isService ? 'Service' : 'Person',
      owner: pick(owners),
      created: randomDate(2019, 2025),
      status: pick(statuses),
    });
  }
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

// --- Relationship generation ---

function buildRelationships(accounts, userGroups, users) {
  const userToGroups = {};    // userId → [groupId, ...]
  const groupToUsers = {};    // groupId → [userId, ...]
  const groupToAccounts = {}; // groupId → [accountId, ...]
  const accountToGroups = {}; // accountId → [groupId, ...]

  for (const g of userGroups) groupToUsers[g.id] = [];
  for (const g of userGroups) groupToAccounts[g.id] = [];
  for (const a of accounts) accountToGroups[a.id] = [];
  for (const u of users) userToGroups[u.id] = [];

  // Every user belongs to ALL_ORGANIZATION_USERS
  const allOrgGroup = userGroups.find(g => g.id === 'grp-all-org-users');
  if (allOrgGroup) {
    for (const u of users) {
      userToGroups[u.id].push(allOrgGroup.id);
      groupToUsers[allOrgGroup.id].push(u.id);
    }
  }

  // Assign each user to 0-4 additional random groups (~15% get none)
  const otherGroups = userGroups.filter(g => g.id !== 'grp-all-org-users');
  for (const u of users) {
    if (rand() < 0.15) continue;
    const numGroups = Math.floor(rand() * 4) + 1;
    const chosen = pickN(otherGroups, Math.min(numGroups, otherGroups.length));
    for (const g of chosen) {
      userToGroups[u.id].push(g.id);
      groupToUsers[g.id].push(u.id);
    }
  }

  // Assign each group to 0-6 random accounts (~20% get none)
  for (const g of userGroups) {
    if (rand() < 0.2) continue;
    const numAccounts = Math.floor(rand() * 6) + 1;
    const chosen = pickN(accounts, Math.min(numAccounts, accounts.length));
    for (const a of chosen) {
      groupToAccounts[g.id].push(a.id);
      accountToGroups[a.id].push(g.id);
    }
  }

  // Deduplicate all arrays
  for (const k in userToGroups) userToGroups[k] = [...new Set(userToGroups[k])];
  for (const k in groupToUsers) groupToUsers[k] = [...new Set(groupToUsers[k])];
  for (const k in groupToAccounts) groupToAccounts[k] = [...new Set(groupToAccounts[k])];
  for (const k in accountToGroups) accountToGroups[k] = [...new Set(accountToGroups[k])];

  // Update counts on groups to reflect real relationships
  for (const g of userGroups) {
    g.userCount = groupToUsers[g.id].length;
    g.accountCount = groupToAccounts[g.id].length;
  }

  return { userToGroups, groupToUsers, groupToAccounts, accountToGroups };
}

// --- Generate and export ---

const accounts = generateAccounts(100);
const userGroups = generateUserGroups(25);
userGroups.unshift({
  id: 'grp-all-org-users',
  name: 'ALL_ORGANIZATION_USERS',
  comment: 'Default group containing all organization users',
  userCount: 0,
  accountCount: 0,
  owner: 'GLOBALORGADMIN',
  created: '2019-01-01',
});
const users = generateUsers(2000);
const relationships = buildRelationships(accounts, userGroups, users);

window.ORG_DATA = { accounts, userGroups, users, relationships };
