/**
 * Database Seed Script
 * Generates comprehensive demo data for all KUBE modules
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.activity.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.report.deleteMany();
  await prisma.animalTelemetry.deleteMany();
  await prisma.herdTelemetry.deleteMany();
  await prisma.healthEvent.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.herd.deleteMany();
  await prisma.pastureZone.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.landChange.deleteMany();
  await prisma.landSurvey.deleteMany();
  await prisma.landZone.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.wildlifeSighting.deleteMany();
  await prisma.patrol.deleteMany();
  await prisma.wildlifePopulation.deleteMany();
  await prisma.parkZone.deleteMany();
  await prisma.park.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kube.africa',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      phone: '+250788000001',
      organization: 'KUBE Platform',
      location: 'Kigali, Rwanda',
      businessType: 'B2B',
      services: JSON.stringify(['KUBE_FARM', 'KUBE_PARK', 'KUBE_LAND']),
      companyName: 'KUBE Platform',
      companySize: '51-200',
      industry: 'Technology'
    }
  });

  const farmer1 = await prisma.user.create({
    data: {
      email: 'farmer@kube.africa',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Mugabo',
      role: 'FARMER',
      phone: '+250788123456',
      organization: 'Kigali Dairy Cooperative',
      location: 'Bugesera, Rwanda',
      businessType: 'B2C',
      services: JSON.stringify(['KUBE_FARM'])
    }
  });

  const farmer2 = await prisma.user.create({
    data: {
      email: 'farmer2@kube.africa',
      password: hashedPassword,
      firstName: 'Grace',
      lastName: 'Uwase',
      role: 'FARMER',
      phone: '+250788123457',
      organization: 'Eastern Province Livestock Association',
      location: 'Kayonza, Rwanda',
      businessType: 'B2C',
      services: JSON.stringify(['KUBE_FARM', 'KUBE_LAND'])
    }
  });

  const ranger = await prisma.user.create({
    data: {
      email: 'ranger@kube.africa',
      password: hashedPassword,
      firstName: 'Patrick',
      lastName: 'Habimana',
      role: 'RANGER',
      phone: '+250788234567',
      organization: 'Rwanda Development Board',
      location: 'Akagera National Park',
      businessType: 'B2B',
      services: JSON.stringify(['KUBE_PARK']),
      companyName: 'Rwanda Development Board',
      companySize: '200+',
      industry: 'Government'
    }
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@kube.africa',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Mutesi',
      role: 'ANALYST',
      phone: '+250788345678',
      organization: 'MINAGRI',
      location: 'Kigali, Rwanda',
      businessType: 'B2B',
      services: JSON.stringify(['KUBE_FARM', 'KUBE_PARK', 'KUBE_LAND']),
      companyName: 'MINAGRI',
      companySize: '200+',
      industry: 'Government'
    }
  });

  console.log(`✅ Created ${await prisma.user.count()} users`);

  // Create Farms (KUBE-Farm)
  console.log('\n🐄 Creating KUBE-Farm data...');

  const farm1 = await prisma.farm.create({
    data: {
      name: 'Bugesera Valley Farm',
      description: 'Large-scale dairy and beef cattle operation',
      location: 'Bugesera District, Eastern Province',
      latitude: -2.1234,
      longitude: 30.1234,
      area: 450,
      ownerId: farmer1.id,
      status: 'ACTIVE'
    }
  });

  const farm2 = await prisma.farm.create({
    data: {
      name: 'Kayonza Livestock Center',
      description: 'Community-managed livestock cooperative',
      location: 'Kayonza District, Eastern Province',
      latitude: -1.8912,
      longitude: 30.6543,
      area: 320,
      ownerId: farmer2.id,
      status: 'MONITORED'
    }
  });

  // Add more farms for better stats
  await prisma.farm.create({
    data: {
      name: 'Nyagatare Cattle Ranch',
      description: 'Large-scale beef production',
      location: 'Nyagatare District, Eastern Province',
      latitude: -1.4567,
      longitude: 30.3214,
      area: 680,
      ownerId: admin.id,
      status: 'ACTIVE'
    }
  });

  await prisma.farm.create({
    data: {
      name: 'Muhanga Dairy Cooperative',
      description: 'Smallholder dairy cooperative',
      location: 'Muhanga District, Southern Province',
      latitude: -2.0842,
      longitude: 29.7456,
      area: 185,
      ownerId: farmer1.id,
      status: 'ACTIVE'
    }
  });

  // Create Herds
  const herd1 = await prisma.herd.create({
    data: {
      name: 'Main Dairy Herd',
      description: 'Primary dairy cattle herd',
      animalType: 'cattle',
      totalCount: 245,
      healthyCount: 230,
      sickCount: 12,
      missingCount: 3,
      status: 'HEALTHY',
      farmId: farm1.id,
      avgHealth: 92.5,
      riskScore: 15.2,
      lastSeenAt: new Date()
    }
  });

  const herd2 = await prisma.herd.create({
    data: {
      name: 'Beef Cattle Herd',
      description: 'Beef cattle for market',
      animalType: 'cattle',
      totalCount: 180,
      healthyCount: 175,
      sickCount: 5,
      missingCount: 0,
      status: 'HEALTHY',
      farmId: farm1.id,
      avgHealth: 95.1,
      riskScore: 8.7,
      lastSeenAt: new Date()
    }
  });

  const herd3 = await prisma.herd.create({
    data: {
      name: 'Community Goat Herd',
      description: 'Goat breeding program',
      animalType: 'goats',
      totalCount: 156,
      healthyCount: 148,
      sickCount: 7,
      missingCount: 1,
      status: 'HEALTHY',
      farmId: farm2.id,
      avgHealth: 90.3,
      riskScore: 12.1,
      lastSeenAt: new Date()
    }
  });

  // Create Animals
  console.log('   Creating animals...');
  const animalNames = ['Bella', 'Max', 'Luna', 'Charlie', 'Daisy', 'Rocky', 'Molly', 'Duke', 'Coco', 'Bailey', 'Simba', 'Nala', 'Hope', 'Faith', 'Grace', 'Joy'];
  const breeds = ['Friesian', 'Ankole', 'Sahiwal', 'Boran', 'Jersey', 'Guernsey'];

  // Create 180 animals total for impressive counts
  for (let i = 0; i < 180; i++) {
    await prisma.animal.create({
      data: {
        tagId: `RW-${String(10000 + i).padStart(5, '0')}`,
        name: animalNames[i % animalNames.length],
        species: 'Bovine',
        breed: breeds[i % breeds.length],
        gender: i % 2 === 0 ? 'Female' : 'Male',
        age: Math.floor(Math.random() * 8) + 1,
        weight: 300 + Math.random() * 200,
        status: i < 8 ? 'SICK' : i >= 175 ? 'MISSING' : 'HEALTHY',
        herdId: i < 80 ? herd1.id : i < 140 ? herd2.id : herd3.id,
        temperature: 38 + Math.random() * 1.5,
        heartRate: 60 + Math.floor(Math.random() * 20),
        lastSeenLat: -2.1234 + (Math.random() - 0.5) * 0.01,
        lastSeenLng: 30.1234 + (Math.random() - 0.5) * 0.01,
        lastSeenAt: new Date(),
        lastHealthCheck: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create Pasture Zones
  await prisma.pastureZone.create({
    data: {
      name: 'North Grazing Zone',
      farmId: farm1.id,
      coordinates: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-2.120, 30.120], [-2.120, 30.125], [-2.125, 30.125], [-2.125, 30.120], [-2.120, 30.120]]]
      }),
      area: 85,
      ndviValue: 0.72,
      biomass: 3200,
      soilMoisture: 45,
      degradation: 18,
      capacity: 120,
      currentLoad: 95,
      lastSurveyAt: new Date()
    }
  });

  await prisma.pastureZone.create({
    data: {
      name: 'South Grazing Zone',
      farmId: farm1.id,
      coordinates: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-2.130, 30.120], [-2.130, 30.128], [-2.138, 30.128], [-2.138, 30.120], [-2.130, 30.120]]]
      }),
      area: 120,
      ndviValue: 0.65,
      biomass: 2800,
      soilMoisture: 38,
      degradation: 32,
      capacity: 150,
      currentLoad: 150,
      lastSurveyAt: new Date()
    }
  });

  console.log(`✅ Created ${await prisma.farm.count()} farms`);
  console.log(`✅ Created ${await prisma.herd.count()} herds`);
  console.log(`✅ Created ${await prisma.animal.count()} animals`);

  // Create Parks (KUBE-Park)
  console.log('\n🦁 Creating KUBE-Park data...');

  const akagera = await prisma.park.create({
    data: {
      name: 'Akagera National Park',
      description: 'Rwanda\'s largest protected wetland and the last remaining refuge for savannah-adapted species',
      parkType: 'national_park',
      location: 'Eastern Province, Rwanda',
      latitude: -1.7500,
      longitude: 30.7500,
      area: 1122,
      status: 'PROTECTED',
      managerId: ranger.id
    }
  });

  const nyungwe = await prisma.park.create({
    data: {
      name: 'Nyungwe Forest National Park',
      description: 'One of Africa\'s oldest rainforests and a biodiversity hotspot',
      parkType: 'national_park',
      location: 'Southern Province, Rwanda',
      latitude: -2.4833,
      longitude: 29.2000,
      area: 970,
      status: 'PROTECTED',
      managerId: ranger.id
    }
  });

  // Create Wildlife Populations
  const elephants = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Elephant',
      commonName: 'African Elephant',
      scientificName: 'Loxodonta africana',
      estimatedCount: 124,
      lastCensusCount: 118,
      trend: 'increasing',
      conservationStatus: 'vulnerable',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  });

  const lions = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Lion',
      commonName: 'African Lion',
      scientificName: 'Panthera leo',
      estimatedCount: 42,
      lastCensusCount: 38,
      trend: 'stable',
      conservationStatus: 'vulnerable',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    }
  });

  const giraffes = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Giraffe',
      commonName: 'Masai Giraffe',
      scientificName: 'Giraffa camelopardalis',
      estimatedCount: 87,
      lastCensusCount: 82,
      trend: 'increasing',
      conservationStatus: 'endangered',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  });

  const chimpanzees = await prisma.wildlifePopulation.create({
    data: {
      parkId: nyungwe.id,
      species: 'Chimpanzee',
      commonName: 'Eastern Chimpanzee',
      scientificName: 'Pan troglodytes schweinfurthii',
      estimatedCount: 400,
      lastCensusCount: 385,
      trend: 'stable',
      conservationStatus: 'endangered',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    }
  });

  // Add more wildlife species
  const zebras = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Zebra',
      commonName: 'Plains Zebra',
      scientificName: 'Equus quagga',
      estimatedCount: 156,
      lastCensusCount: 148,
      trend: 'stable',
      conservationStatus: 'least_concern',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
    }
  });

  const buffalo = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Buffalo',
      commonName: 'African Buffalo',
      scientificName: 'Syncerus caffer',
      estimatedCount: 320,
      lastCensusCount: 305,
      trend: 'increasing',
      conservationStatus: 'least_concern',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    }
  });

  const rhinos = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Rhinoceros',
      commonName: 'Black Rhinoceros',
      scientificName: 'Diceros bicornis',
      estimatedCount: 28,
      lastCensusCount: 25,
      trend: 'increasing',
      conservationStatus: 'critically_endangered',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    }
  });

  const leopards = await prisma.wildlifePopulation.create({
    data: {
      parkId: akagera.id,
      species: 'Leopard',
      commonName: 'African Leopard',
      scientificName: 'Panthera pardus',
      estimatedCount: 18,
      lastCensusCount: 16,
      trend: 'stable',
      conservationStatus: 'vulnerable',
      healthStatus: 'healthy',
      lastCensusAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
    }
  });

  // Create Wildlife Sightings
  for (let i = 0; i < 20; i++) {
    await prisma.wildlifeSighting.create({
      data: {
        populationId: [elephants.id, lions.id, giraffes.id][i % 3],
        count: Math.floor(Math.random() * 15) + 1,
        latitude: -1.7500 + (Math.random() - 0.5) * 0.2,
        longitude: 30.7500 + (Math.random() - 0.5) * 0.2,
        behavior: ['grazing', 'resting', 'migrating', 'drinking'][Math.floor(Math.random() * 4)],
        health: 'healthy',
        detectedBy: 'ai',
        confidence: 0.85 + Math.random() * 0.14,
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create Patrols
  const patrol1 = await prisma.patrol.create({
    data: {
      parkId: akagera.id,
      name: 'Northern Sector Anti-Poaching Patrol',
      patrolType: 'anti_poaching',
      status: 'COMPLETED',
      routeCoordinates: JSON.stringify({
        type: 'LineString',
        coordinates: [[-1.740, 30.740], [-1.745, 30.750], [-1.750, 30.760]]
      }),
      plannedDistance: 15.5,
      actualDistance: 16.2,
      scheduledStart: new Date(Date.now() - 48 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() - 42 * 60 * 60 * 1000),
      actualStart: new Date(Date.now() - 48 * 60 * 60 * 1000),
      actualEnd: new Date(Date.now() - 42 * 60 * 60 * 1000),
      rangers: JSON.stringify(['Patrick Habimana', 'Eric Nkusi', 'Jean Pierre Byiringiro'])
    }
  });

  const patrol2 = await prisma.patrol.create({
    data: {
      parkId: akagera.id,
      name: 'Lake Zone Wildlife Census',
      patrolType: 'survey',
      status: 'IN_PROGRESS',
      routeCoordinates: JSON.stringify({
        type: 'LineString',
        coordinates: [[-1.755, 30.755], [-1.760, 30.765], [-1.765, 30.775]]
      }),
      plannedDistance: 22.3,
      scheduledStart: new Date(Date.now() - 2 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 4 * 60 * 60 * 1000),
      actualStart: new Date(Date.now() - 2 * 60 * 60 * 1000),
      rangers: JSON.stringify(['Patrick Habimana', 'Marie Uwera'])
    }
  });

  // Add more active patrols
  await prisma.patrol.create({
    data: {
      parkId: akagera.id,
      name: 'Southern Border Surveillance',
      patrolType: 'anti_poaching',
      status: 'IN_PROGRESS',
      routeCoordinates: JSON.stringify({
        type: 'LineString',
        coordinates: [[-1.800, 30.740], [-1.810, 30.750], [-1.820, 30.760]]
      }),
      plannedDistance: 18.7,
      scheduledStart: new Date(Date.now() - 1 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 5 * 60 * 60 * 1000),
      actualStart: new Date(Date.now() - 1 * 60 * 60 * 1000),
      rangers: JSON.stringify(['Eric Nkusi', 'Jean Pierre Byiringiro'])
    }
  });

  await prisma.patrol.create({
    data: {
      parkId: nyungwe.id,
      name: 'Nyungwe Primate Monitoring',
      patrolType: 'survey',
      status: 'SCHEDULED',
      routeCoordinates: JSON.stringify({
        type: 'LineString',
        coordinates: [[-2.480, 29.200], [-2.490, 29.210], [-2.500, 29.220]]
      }),
      plannedDistance: 12.5,
      scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 8 * 60 * 60 * 1000),
      rangers: JSON.stringify(['Marie Uwera', 'David Mugisha'])
    }
  });

  // Create Incidents
  await prisma.incident.create({
    data: {
      parkId: akagera.id,
      patrolId: patrol1.id,
      type: 'INTRUSION',
      severity: 'MEDIUM',
      title: 'Unauthorized Livestock Grazing Detected',
      description: 'Drone patrol detected approximately 30 cattle grazing in the northern buffer zone. Herders were contacted and livestock removed.',
      latitude: -1.7423,
      longitude: 30.7512,
      location: 'Northern Buffer Zone, Grid Sector 4B',
      status: 'resolved',
      reportedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      actionTaken: 'Rangers contacted local authorities. Livestock removed. Community education session scheduled.',
      outcome: 'Resolved peacefully. No animals harmed.'
    }
  });

  await prisma.incident.create({
    data: {
      parkId: akagera.id,
      type: 'INJURY',
      severity: 'HIGH',
      title: 'Injured Giraffe Spotted',
      description: 'Female giraffe with visible limp in left rear leg detected by thermal imaging. Veterinary team dispatched.',
      latitude: -1.7589,
      longitude: 30.7634,
      location: 'Central Plains, near Mutumba Hills',
      status: 'investigating',
      reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  });

  console.log(`✅ Created ${await prisma.park.count()} parks`);
  console.log(`✅ Created ${await prisma.wildlifePopulation.count()} wildlife populations`);
  console.log(`✅ Created ${await prisma.patrol.count()} patrols`);
  console.log(`✅ Created ${await prisma.incident.count()} incidents`);

  // Create Land Zones (KUBE-Land)
  console.log('\n🌍 Creating KUBE-Land data...');

  const zone1 = await prisma.landZone.create({
    data: {
      name: 'Bugesera Grasslands',
      description: 'Community grazing lands with moderate degradation',
      coordinates: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-2.100, 30.100], [-2.100, 30.150], [-2.150, 30.150], [-2.150, 30.100], [-2.100, 30.100]]]
      }),
      area: 2850,
      region: 'Eastern Province',
      district: 'Bugesera',
      landUseType: 'grassland',
      ownership: 'communal',
      vegetationIndex: 0.58,
      soilHealth: 65,
      degradationLevel: 38,
      erosionRisk: 42,
      avgRainfall: 850,
      avgTemperature: 21.5,
      droughtRisk: 55,
      lastSurveyAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  });

  const zone2 = await prisma.landZone.create({
    data: {
      name: 'Kayonza Agricultural Zone',
      description: 'Mixed agricultural and grazing land',
      coordinates: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-1.880, 30.640], [-1.880, 30.680], [-1.920, 30.680], [-1.920, 30.640], [-1.880, 30.640]]]
      }),
      area: 1920,
      region: 'Eastern Province',
      district: 'Kayonza',
      landUseType: 'agricultural',
      ownership: 'mixed',
      vegetationIndex: 0.71,
      soilHealth: 78,
      degradationLevel: 22,
      erosionRisk: 28,
      avgRainfall: 1100,
      avgTemperature: 20.2,
      droughtRisk: 32,
      lastSurveyAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    }
  });

  // Add more land zones
  await prisma.landZone.create({
    data: {
      name: 'Rwamagana Highlands',
      description: 'Forested hillside with agroforestry',
      coordinates: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[-1.950, 30.430], [-1.950, 30.470], [-1.990, 30.470], [-1.990, 30.430], [-1.950, 30.430]]]
      }),
      area: 1450,
      region: 'Eastern Province',
      district: 'Rwamagana',
      landUseType: 'forest',
      ownership: 'state',
      vegetationIndex: 0.82,
      soilHealth: 85,
      degradationLevel: 12,
      erosionRisk: 18,
      avgRainfall: 1250,
      avgTemperature: 19.8,
      droughtRisk: 25,
      lastSurveyAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    }
  });

  // Create Land Surveys
  await prisma.landSurvey.create({
    data: {
      zoneId: zone1.id,
      surveyType: 'aerial',
      ndvi: 0.58,
      biomass: 2400,
      treeCanopyCover: 12,
      bareGround: 25,
      waterBodies: 3,
      healthScore: 62,
      surveyDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      recommendations: 'Implement rotational grazing. Consider reseeding in bare areas. Monitor water sources.'
    }
  });

  await prisma.landSurvey.create({
    data: {
      zoneId: zone2.id,
      surveyType: 'aerial',
      ndvi: 0.71,
      biomass: 3800,
      treeCanopyCover: 28,
      bareGround: 8,
      waterBodies: 5,
      healthScore: 78,
      surveyDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      recommendations: 'Maintain current practices. Excellent soil health. Continue agroforestry efforts.'
    }
  });

  // Create Land Changes
  await prisma.landChange.create({
    data: {
      zoneId: zone1.id,
      changeType: 'degradation',
      severity: 'medium',
      affectedArea: 245,
      impactDescription: 'Overgrazing has led to significant bare soil exposure in the southern section.',
      causesIdentified: 'Extended dry season combined with overstocking. No rotational grazing system in place.',
      recommendedAction: 'Immediate reduction of livestock density. Implement rotational grazing. Reseed affected areas.',
      detectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    }
  });

  console.log(`✅ Created ${await prisma.landZone.count()} land zones`);
  console.log(`✅ Created ${await prisma.landSurvey.count()} land surveys`);
  console.log(`✅ Created ${await prisma.landChange.count()} land changes`);

  // Create Alerts
  console.log('\n🚨 Creating alerts...');

  await prisma.alert.create({
    data: {
      type: 'HEALTH',
      severity: 'CRITICAL',
      status: 'NEW',
      title: 'Fever Detected in Multiple Animals',
      message: 'Thermal imaging detected elevated temperatures in 12 animals in Main Dairy Herd',
      details: 'Average temperature: 40.2°C (normal: 38-39°C). Potential disease outbreak. Immediate veterinary attention required.',
      module: 'farm',
      entityType: 'herd',
      entityId: herd1.id,
      farmId: farm1.id,
      latitude: -2.1234,
      longitude: 30.1234,
      location: 'Bugesera Valley Farm - Main Dairy Herd'
    }
  });

  await prisma.alert.create({
    data: {
      type: 'SECURITY',
      severity: 'WARNING',
      status: 'ACKNOWLEDGED',
      title: 'Missing Animals Detected',
      message: '3 cattle not detected in last aerial survey',
      details: 'Animals with tags RW-10048, RW-10049, RW-10050 not seen in past 24 hours. Last known location: South Grazing Zone.',
      module: 'farm',
      entityType: 'herd',
      entityId: herd1.id,
      farmId: farm1.id,
      latitude: -2.1345,
      longitude: 30.1267,
      location: 'Bugesera Valley Farm - South Zone',
      assignedToId: farmer1.id
    }
  });

  await prisma.alert.create({
    data: {
      type: 'ENVIRONMENTAL',
      severity: 'WARNING',
      status: 'NEW',
      title: 'Pasture Degradation Warning',
      message: 'NDVI dropping below healthy threshold in South Grazing Zone',
      details: 'NDVI: 0.65 (down from 0.74 last month). Current stocking rate exceeds recommended capacity. Risk of overgrazing.',
      module: 'farm',
      farmId: farm1.id,
      latitude: -2.1340,
      longitude: 30.1240,
      location: 'South Grazing Zone'
    }
  });

  await prisma.alert.create({
    data: {
      type: 'SECURITY',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      title: 'Potential Poaching Activity',
      message: 'Unusual movement detected in restricted zone',
      details: 'Night thermal patrol detected human activity near elephant habitat. Multiple heat signatures moving toward park boundary.',
      module: 'park',
      latitude: -1.7498,
      longitude: 30.7623,
      location: 'Akagera National Park - Northern Sector',
      assignedToId: ranger.id
    }
  });

  await prisma.alert.create({
    data: {
      type: 'ENVIRONMENTAL',
      severity: 'WARNING',
      status: 'NEW',
      title: 'Land Degradation Detected',
      message: 'Significant vegetation loss in Bugesera Grasslands',
      details: 'Satellite analysis shows 15% reduction in vegetation cover over 3 months. Bare soil exposure increasing.',
      module: 'land',
      latitude: -2.1250,
      longitude: 30.1250,
      location: 'Bugesera Grasslands - Southern Section'
    }
  });

  console.log(`✅ Created ${await prisma.alert.count()} alerts`);

  // Create Activities
  console.log('\n📊 Creating activities...');

  await prisma.activity.create({
    data: {
      type: 'USER_LOGIN',
      action: 'login',
      description: 'User logged in successfully',
      userId: farmer1.id,
      module: 'system',
      timestamp: new Date()
    }
  });

  await prisma.activity.create({
    data: {
      type: 'ALERT_CREATED',
      action: 'create',
      description: 'Critical health alert created for Main Dairy Herd',
      userId: admin.id,
      module: 'farm',
      entityType: 'alert',
      timestamp: new Date()
    }
  });

  await prisma.activity.create({
    data: {
      type: 'PATROL_COMPLETED',
      action: 'complete',
      description: 'Northern Sector Anti-Poaching Patrol completed successfully',
      userId: ranger.id,
      module: 'park',
      entityType: 'patrol',
      entityId: patrol1.id,
      timestamp: new Date(Date.now() - 42 * 60 * 60 * 1000)
    }
  });

  console.log(`✅ Created ${await prisma.activity.count()} activities`);

  console.log('\n✅ Database seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Farms: ${await prisma.farm.count()}`);
  console.log(`   - Herds: ${await prisma.herd.count()}`);
  console.log(`   - Animals: ${await prisma.animal.count()}`);
  console.log(`   - Parks: ${await prisma.park.count()}`);
  console.log(`   - Wildlife Populations: ${await prisma.wildlifePopulation.count()}`);
  console.log(`   - Land Zones: ${await prisma.landZone.count()}`);
  console.log(`   - Alerts: ${await prisma.alert.count()}`);
  console.log(`   - Activities: ${await prisma.activity.count()}`);
  console.log('\n🔐 Default login credentials:');
  console.log('   Admin:   admin@kube.africa / password123');
  console.log('   Farmer:  farmer@kube.africa / password123');
  console.log('   Ranger:  ranger@kube.africa / password123');
  console.log('   Analyst: analyst@kube.africa / password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
