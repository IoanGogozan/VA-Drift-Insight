import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  FieldTaskMethod,
  FieldTaskStatus,
  FieldTaskType,
  RecommendationPriority
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { UpdateFieldTaskDto } from "./dto/update-field-task.dto";

type FieldTaskFilters = {
  priority?: RecommendationPriority;
  status?: FieldTaskStatus;
};

const priorityOrder: Record<RecommendationPriority, number> = {
  high: 1,
  medium: 2,
  low: 3
};

@Injectable()
export class FieldTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getFieldTasks(filters: FieldTaskFilters) {
    this.validateFilters(filters);

    const tasks = await this.prisma.fieldTask.findMany({
      where: {
        priority: filters.priority,
        status: filters.status
      },
      include: {
        zone: {
          select: { id: true, name: true }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return tasks.map(formatFieldTask).sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.areaName.localeCompare(b.areaName);
    });
  }

  async getFieldTask(id: string) {
    const task = await this.prisma.fieldTask.findUnique({
      where: { id },
      include: {
        zone: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      throw new NotFoundException("Field task was not found.");
    }

    return formatFieldTask(task);
  }

  async updateFieldTask(id: string, dto: UpdateFieldTaskDto) {
    const existing = await this.prisma.fieldTask.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException("Field task was not found.");
    }

    const task = await this.prisma.fieldTask.update({
      where: { id },
      data: {
        status: dto.status,
        lastChecked:
          dto.lastChecked === null
            ? null
            : dto.lastChecked
              ? new Date(dto.lastChecked)
              : dto.status === "completed"
                ? new Date()
                : undefined
      },
      include: {
        zone: {
          select: { id: true, name: true }
        }
      }
    });

    return formatFieldTask(task);
  }

  private validateFilters(filters: FieldTaskFilters) {
    if (filters.priority && !Object.values(RecommendationPriority).includes(filters.priority)) {
      throw new BadRequestException("Invalid field task priority.");
    }

    if (filters.status && !Object.values(FieldTaskStatus).includes(filters.status)) {
      throw new BadRequestException("Invalid field task status.");
    }
  }
}

function formatFieldTask<T extends {
  id: string;
  type: FieldTaskType;
  priority: RecommendationPriority;
  reason: string;
  suggestedMethod: FieldTaskMethod;
  status: FieldTaskStatus;
  lastChecked: Date | null;
  createdAt: Date;
  updatedAt: Date;
  zone: { id: string; name: string };
}>(task: T) {
  return {
    id: task.id,
    type: task.type,
    typeLabel: getTypeLabel(task.type),
    zoneId: task.zone.id,
    areaName: task.zone.name,
    priority: task.priority,
    priorityLabel: getPriorityLabel(task.priority),
    reason: task.reason,
    suggestedMethod: task.suggestedMethod,
    suggestedMethodLabel: getMethodLabel(task.suggestedMethod),
    status: task.status,
    statusLabel: getStatusLabel(task.status),
    lastChecked: task.lastChecked,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function getTypeLabel(type: FieldTaskType) {
  const labels: Record<FieldTaskType, string> = {
    leakage_control: "Lekkasjekontroll",
    fremmedvann_control: "Fremmedvann",
    meter_follow_up: "Måleroppfølging",
    valve_check: "Ventilkontroll",
    data_quality: "Datakvalitet"
  };

  return labels[type];
}

function getMethodLabel(method: FieldTaskMethod) {
  const labels: Record<FieldTaskMethod, string> = {
    listening: "Lytting",
    logger: "Logger",
    valve_check: "Ventilkontroll",
    meter_follow_up: "Måleroppfølging",
    manhole_inspection: "Kuminspeksjon",
    cctv: "CCTV",
    smoke_test: "Røyktest"
  };

  return labels[method];
}

function getStatusLabel(status: FieldTaskStatus) {
  const labels: Record<FieldTaskStatus, string> = {
    new: "Ny",
    planned: "Planlagt",
    in_progress: "Pågår",
    completed: "Utført",
    cancelled: "Kansellert"
  };

  return labels[status];
}

function getPriorityLabel(priority: RecommendationPriority) {
  const labels: Record<RecommendationPriority, string> = {
    high: "Høy",
    medium: "Medium",
    low: "Lav"
  };

  return labels[priority];
}
