'use client';

import Image from 'next/image';
import { useState } from 'react';
import { EnergyProductFormDialog } from '@/components/admin/energy-product-form-dialog';
import { EnergyRequestDetailSheet } from '@/components/admin/energy-request-detail-sheet';
import { AdminErrorState } from '@/components/admin/shared/admin-error-state';
import { AdminFiltersBar } from '@/components/admin/shared/admin-filters-bar';
import { AdminTableEmpty } from '@/components/admin/shared/admin-table-empty';
import { AdminTableSkeletonRows } from '@/components/admin/shared/admin-table-skeleton-rows';
import { PageHeader } from '@/components/shared/page-header';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/permissions';
import { formatDate, formatUsd } from '@/lib/admin/format';
import {
  useAdminEnergyRequests,
  useChargingProducts,
} from '@/queries/operations';
import {
  energyRequestStatuses,
  type AdminEnergyRequestsFilters,
  type ChargingProduct,
  type EnergyRequest,
} from '@/types/admin/operations';

export function AdminEnergyPanel() {
  const { can } = usePermissions();
  const canManageProducts = can('parts:manage');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ChargingProduct | null>(
    null,
  );
  const [requestFilters, setRequestFilters] =
    useState<AdminEnergyRequestsFilters>({ page: 1, limit: 25 });
  const [selectedRequest, setSelectedRequest] = useState<EnergyRequest | null>(
    null,
  );
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);

  const products = useChargingProducts();
  const requests = useAdminEnergyRequests(requestFilters);
  const productRows = products.data ?? [];
  const requestRows = requests.data?.items ?? [];

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: ChargingProduct) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const openRequest = (request: EnergyRequest) => {
    setSelectedRequest(request);
    setRequestSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy"
        description="Manage charging products and review quote requests from the public energy form."
      />

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Charging products</TabsTrigger>
          <TabsTrigger value="requests">Quote requests</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 space-y-4">
          {canManageProducts ? (
            <Button onClick={openCreateProduct}>Add product</Button>
          ) : null}

          {products.isError ? (
            <AdminErrorState
              message={
                products.error instanceof Error
                  ? products.error.message
                  : 'Failed to load products.'
              }
            />
          ) : null}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Power</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.isLoading ? (
                  <AdminTableSkeletonRows columns={5} rows={3} />
                ) : null}
                {!products.isLoading && productRows.length === 0 ? (
                  <AdminTableEmpty
                    colSpan={5}
                    title="No charging products yet"
                    description="Add a product to show on the public energy page."
                  />
                ) : null}
                {products.data?.map((product) => {
                  const thumb =
                    product.photos.find((p) => p.isPrimary)?.url ??
                    product.photos[0]?.url;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt=""
                              width={40}
                              height={40}
                              className="size-10 rounded object-cover"
                            />
                          ) : null}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.productType.replaceAll('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {product.powerKw != null
                          ? `${product.powerKw} kW`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {product.priceUsd != null
                          ? formatUsd(product.priceUsd)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {canManageProducts ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditProduct(product)}
                          >
                            Edit
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4 space-y-4">
          <AdminFiltersBar>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={requestFilters.status ?? 'ALL'}
                onValueChange={(value) =>
                  setRequestFilters((current) => ({
                    ...current,
                    status:
                      value === 'ALL'
                        ? undefined
                        : (value as AdminEnergyRequestsFilters['status']),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {energyRequestStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AdminFiltersBar>

          {requests.isError ? (
            <AdminErrorState
              message={
                requests.error instanceof Error
                  ? requests.error.message
                  : 'Failed to load requests.'
              }
            />
          ) : null}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.isLoading ? (
                  <AdminTableSkeletonRows columns={5} />
                ) : null}
                {!requests.isLoading && requestRows.length === 0 ? (
                  <AdminTableEmpty
                    colSpan={5}
                    title="No energy requests found"
                    description="Try another status filter."
                  />
                ) : null}
                {requestRows.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.contactName}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {[request.city, request.location]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRequest(request)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {requests.data?.meta ? (
            <PaginationBar
              meta={requests.data.meta}
              onPageChange={(page) =>
                setRequestFilters((current) => ({ ...current, page }))
              }
            />
          ) : null}
        </TabsContent>
      </Tabs>

      <EnergyProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
      />

      <EnergyRequestDetailSheet
        request={selectedRequest}
        open={requestSheetOpen}
        onOpenChange={setRequestSheetOpen}
      />
    </div>
  );
}
