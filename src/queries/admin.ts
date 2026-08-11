'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  activatePart,
  approveAdminOperator,
  approveAdminStation,
  approveListing,
  advanceListingInventoryStage,
  approvePart,
  createAdminListing,
  createPart,
  getAdminOperators,
  getAdminStations,
  toAdminCreateListingBody,
  toAdminUpdateListingBody,
  updateAdminListing,
  deactivatePart,
  deleteListing,
  deletePart,
  featureListing,
  getAdminListings,
  getAdminPart,
  getAdminParts,
  getAdminSeller,
  getAdminSellers,
  getDashboard,
  hotDealListing,
  publishListing,
  unpublishListing,
  reactivateSeller,
  rejectAdminOperator,
  rejectAdminStation,
  rejectListing,
  rejectPart,
  suspendSeller,
  suspendAdminStation,
  updateListingVerification,
  updatePart,
  verifySeller,
} from '@/lib/api/admin';
import {
  addSubcategory,
  createCategory,
  deactivateCategory,
  deleteSubcategory,
  getAdminCategories,
  permanentlyDeleteCategory,
  reactivateCategory,
  updateCategory,
  updateSubcategory,
} from '@/lib/api/categories';
import type { AdminCategoriesFilters } from '@/lib/api/categories';
import { ApiClientError } from '@/lib/api';
import {
  invalidateCategoryQueries,
  invalidateListingQueries,
  invalidatePartQueries,
  invalidateSellerQueries,
  invalidateStationQueries,
} from '@/lib/query/invalidate-admin';
import type {
  AdminOperatorFilters,
  AdminStationFilters,
  StationReviewActionInput,
} from '@/types/admin/stations';
import type {
  AdminListing,
  AdminListingsFilters,
  AdminPartsFilters,
  AdminSellersFilters,
} from '@/types/admin/marketplace';
import type {
  AdminCreateListingInput,
  AdminUpdateListingInput,
  CreateCategoryInput,
  CreatePartInput,
  CreateSubcategoryInput,
  RejectListingInput,
  SuspendSellerInput,
  UpdateCategoryInput,
  UpdatePartInput,
  UpdateSubcategoryInput,
  UpdateVerificationInput,
} from '@/schemas/admin';

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  listings: (filters: AdminListingsFilters) =>
    [...adminKeys.all, 'listings', filters] as const,
  sellers: (filters: AdminSellersFilters) =>
    [...adminKeys.all, 'sellers', filters] as const,
  seller: (id: string) => [...adminKeys.all, 'seller', id] as const,
  parts: (filters: AdminPartsFilters) =>
    [...adminKeys.all, 'parts', filters] as const,
  part: (id: string) => [...adminKeys.all, 'part', id] as const,
  categories: (filters: AdminCategoriesFilters = {}) =>
    [...adminKeys.all, 'categories', filters] as const,
  operators: (filters: AdminOperatorFilters) =>
    [...adminKeys.all, 'operators', filters] as const,
  stations: (filters: AdminStationFilters) =>
    [...adminKeys.all, 'stations', filters] as const,
};

function mutationError(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : 'Something went wrong. Please try again.';
}

export function useDashboard(enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: getDashboard,
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminListings(
  filters: AdminListingsFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: adminKeys.listings(filters),
    queryFn: () => getAdminListings(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useCreateAdminListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      photos = [],
      video,
      brochure,
    }: {
      body: AdminCreateListingInput;
      photos?: File[];
      video?: File | null;
      brochure?: File | null;
    }) =>
      createAdminListing(
        toAdminCreateListingBody(body),
        photos,
        video,
        brochure,
      ),
    onSuccess: () => {
      toast.success('Listing created');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateAdminListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
      photos = [],
      video,
      brochure,
    }: {
      id: string;
      body: AdminUpdateListingInput;
      photos?: File[];
      video?: File | null;
      brochure?: File | null;
    }) =>
      updateAdminListing(
        id,
        toAdminUpdateListingBody(body),
        photos,
        video,
        brochure,
      ),
    onSuccess: () => {
      toast.success('Listing updated');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useApproveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveListing,
    onSuccess: () => {
      toast.success('Listing approved');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function usePublishListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishListing,
    onSuccess: () => {
      toast.success('Listing published');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdvanceListingInventoryStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      stage,
    }: {
      id: string;
      stage: NonNullable<AdminListing['inventoryStage']>;
    }) => advanceListingInventoryStage(id, stage),
    onSuccess: () => {
      toast.success('Inventory stage updated');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUnpublishListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishListing,
    onSuccess: () => {
      toast.success('Listing unpublished');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useRejectListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RejectListingInput }) =>
      rejectListing(id, body),
    onSuccess: () => {
      toast.success('Listing rejected');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useFeatureListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: featureListing,
    onSuccess: () => {
      toast.success('Featured flag updated');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useHotDealListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotDealListing,
    onSuccess: () => {
      toast.success('Hot deal flag updated');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success('Listing deleted');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateListingVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
      files,
    }: {
      id: string;
      body: UpdateVerificationInput;
      files?: { report?: File; batteryReport?: File };
    }) => updateListingVerification(id, body, files),
    onSuccess: () => {
      toast.success('Verification updated');
      invalidateListingQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminSellers(filters: AdminSellersFilters, enabled = true) {
  return useQuery({
    queryKey: adminKeys.sellers(filters),
    queryFn: () => getAdminSellers(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useAdminSeller(id: string | null) {
  return useQuery({
    queryKey: adminKeys.seller(id ?? ''),
    queryFn: () => getAdminSeller(id!),
    enabled: Boolean(id),
  });
}

export function useVerifySeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifySeller,
    onSuccess: () => {
      toast.success('Seller verified');
      invalidateSellerQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useSuspendSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SuspendSellerInput }) =>
      suspendSeller(id, body),
    onSuccess: () => {
      toast.success('Seller suspended');
      invalidateSellerQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useReactivateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateSeller,
    onSuccess: () => {
      toast.success('Seller reactivated');
      invalidateSellerQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminParts(filters: AdminPartsFilters, enabled = true) {
  return useQuery({
    queryKey: adminKeys.parts(filters),
    queryFn: () => getAdminParts(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useActivatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activatePart,
    onSuccess: () => {
      toast.success('Part published');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useDeactivatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePart,
    onSuccess: () => {
      toast.success('Part unpublished');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useApprovePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvePart,
    onSuccess: () => {
      toast.success('Part approved');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useRejectPart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { reason: string } }) =>
      rejectPart(id, body),
    onSuccess: () => {
      toast.success('Part rejected');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminPart(id: string | null) {
  return useQuery({
    queryKey: adminKeys.part(id ?? ''),
    queryFn: () => getAdminPart(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      photos = [],
    }: {
      body: CreatePartInput;
      photos?: File[];
    }) => createPart(body, photos),
    onSuccess: () => {
      toast.success('Part created');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
      photos = [],
    }: {
      id: string;
      body: UpdatePartInput;
      photos?: File[];
    }) => updatePart(id, body, photos),
    onSuccess: () => {
      toast.success('Part updated');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useDeletePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePart,
    onSuccess: () => {
      toast.success('Part deleted');
      invalidatePartQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminCategories(
  filters: AdminCategoriesFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: adminKeys.categories(filters),
    queryFn: () => getAdminCategories(filters),
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCategoryInput) => createCategory(body),
    onSuccess: () => {
      toast.success('Category created');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryInput }) =>
      updateCategory(id, body),
    onSuccess: () => {
      toast.success('Category updated');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      subId,
      body,
    }: {
      categoryId: string;
      subId: string;
      body: UpdateSubcategoryInput;
    }) => updateSubcategory(categoryId, subId, body),
    onSuccess: () => {
      toast.success('Subcategory updated');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateCategory,
    onSuccess: () => {
      toast.success('Category deactivated');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useReactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateCategory,
    onSuccess: () => {
      toast.success('Category reactivated');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function usePermanentlyDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: permanentlyDeleteCategory,
    onSuccess: () => {
      toast.success('Category deleted permanently');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAddSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: string;
      body: CreateSubcategoryInput;
    }) => addSubcategory(categoryId, body),
    onSuccess: () => {
      toast.success('Subcategory added');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      subId,
    }: {
      categoryId: string;
      subId: string;
    }) => deleteSubcategory(categoryId, subId),
    onSuccess: () => {
      toast.success('Subcategory deleted');
      invalidateCategoryQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminOperators(
  filters: AdminOperatorFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: adminKeys.operators(filters),
    queryFn: () => getAdminOperators(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useApproveAdminOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAdminOperator,
    onSuccess: () => {
      toast.success('Operator approved');
      invalidateStationQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useRejectAdminOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: StationReviewActionInput;
    }) => rejectAdminOperator(id, body),
    onSuccess: () => {
      toast.success('Operator rejected');
      invalidateStationQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminStations(filters: AdminStationFilters, enabled = true) {
  return useQuery({
    queryKey: adminKeys.stations(filters),
    queryFn: () => getAdminStations(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useApproveAdminStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAdminStation,
    onSuccess: () => {
      toast.success('Station approved');
      invalidateStationQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useRejectAdminStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: StationReviewActionInput;
    }) => rejectAdminStation(id, body),
    onSuccess: () => {
      toast.success('Station rejected');
      invalidateStationQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useSuspendAdminStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: StationReviewActionInput;
    }) => suspendAdminStation(id, body),
    onSuccess: () => {
      toast.success('Station suspended');
      invalidateStationQueries(queryClient);
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}
