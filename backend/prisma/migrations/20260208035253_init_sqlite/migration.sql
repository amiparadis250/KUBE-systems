-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "organization" TEXT,
    "location" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "businessType" TEXT,
    "services" TEXT,
    "companyName" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "area" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "farms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "herds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "animalType" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "healthyCount" INTEGER NOT NULL,
    "sickCount" INTEGER NOT NULL,
    "missingCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "farmId" TEXT NOT NULL,
    "lastSeenAt" DATETIME,
    "avgHealth" REAL,
    "riskScore" REAL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "herds_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagId" TEXT NOT NULL,
    "name" TEXT,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "gender" TEXT NOT NULL,
    "age" INTEGER,
    "weight" REAL,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "herdId" TEXT NOT NULL,
    "lastHealthCheck" DATETIME,
    "temperature" REAL,
    "heartRate" INTEGER,
    "vaccinations" TEXT,
    "lastSeenLat" REAL,
    "lastSeenLng" REAL,
    "lastSeenAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "animals_herdId_fkey" FOREIGN KEY ("herdId") REFERENCES "herds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "health_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "outcome" TEXT,
    "animalId" TEXT NOT NULL,
    "detectedBy" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "health_events_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pasture_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "ndviValue" REAL,
    "biomass" REAL,
    "soilMoisture" REAL,
    "degradation" REAL,
    "capacity" INTEGER,
    "currentLoad" INTEGER,
    "lastSurveyAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pasture_zones_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "herd_telemetry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "herdId" TEXT NOT NULL,
    "countDetected" INTEGER NOT NULL,
    "countHealthy" INTEGER,
    "countSick" INTEGER,
    "countMissing" INTEGER,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "altitude" REAL,
    "temperature" REAL,
    "humidity" REAL,
    "windSpeed" REAL,
    "droneId" TEXT,
    "missionId" TEXT,
    "imageUrl" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "herd_telemetry_herdId_fkey" FOREIGN KEY ("herdId") REFERENCES "herds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "animal_telemetry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "animalId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "temperature" REAL,
    "heartRate" INTEGER,
    "activity" TEXT,
    "confidence" REAL,
    "droneId" TEXT,
    "imageUrl" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "animal_telemetry_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parkType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "area" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MONITORED',
    "managerId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "parks_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "park_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "zoneType" TEXT NOT NULL,
    "biodiversity" REAL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "park_zones_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wildlife_populations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parkId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT,
    "estimatedCount" INTEGER NOT NULL,
    "lastCensusCount" INTEGER,
    "trend" TEXT,
    "conservationStatus" TEXT,
    "healthStatus" TEXT,
    "lastCensusAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wildlife_populations_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wildlife_sightings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "populationId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "behavior" TEXT,
    "health" TEXT,
    "detectedBy" TEXT NOT NULL,
    "confidence" REAL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "wildlife_sightings_populationId_fkey" FOREIGN KEY ("populationId") REFERENCES "wildlife_populations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "patrols" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "patrolType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "routeCoordinates" TEXT NOT NULL,
    "plannedDistance" REAL,
    "actualDistance" REAL,
    "scheduledStart" DATETIME NOT NULL,
    "scheduledEnd" DATETIME NOT NULL,
    "actualStart" DATETIME,
    "actualEnd" DATETIME,
    "rangers" TEXT,
    "vehicles" TEXT,
    "droneId" TEXT,
    "findings" TEXT,
    "evidenceUrls" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "patrols_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parkId" TEXT NOT NULL,
    "patrolId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL,
    "evidenceUrls" TEXT,
    "witnessReports" TEXT,
    "actionTaken" TEXT,
    "outcome" TEXT,
    "reportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "incidents_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "incidents_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "patrols" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "land_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coordinates" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT,
    "landUseType" TEXT NOT NULL,
    "ownership" TEXT,
    "vegetationIndex" REAL,
    "soilHealth" REAL,
    "degradationLevel" REAL,
    "erosionRisk" REAL,
    "avgRainfall" REAL,
    "avgTemperature" REAL,
    "droughtRisk" REAL,
    "lastSurveyAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "land_surveys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "surveyType" TEXT NOT NULL,
    "ndvi" REAL,
    "biomass" REAL,
    "treeCanopyCover" REAL,
    "bareGround" REAL,
    "waterBodies" REAL,
    "healthScore" REAL,
    "trends" TEXT,
    "recommendations" TEXT,
    "imageUrls" TEXT,
    "dataSource" TEXT,
    "droneId" TEXT,
    "surveyDate" DATETIME NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "land_surveys_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "land_zones" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "land_changes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT,
    "affectedArea" REAL,
    "impactDescription" TEXT NOT NULL,
    "causesIdentified" TEXT,
    "recommendedAction" TEXT,
    "detectedAt" DATETIME NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "land_changes_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "land_zones" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "module" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "location" TEXT,
    "assignedToId" TEXT,
    "farmId" TEXT,
    "actionTaken" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationChannels" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "alerts_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "alerts_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "dataSnapshot" TEXT NOT NULL,
    "charts" TEXT,
    "generatedById" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'private',
    "pdfUrl" TEXT,
    "excelUrl" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "module" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "animals_tagId_key" ON "animals"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");
