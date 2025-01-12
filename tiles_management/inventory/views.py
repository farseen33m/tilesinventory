from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status




# Create your views here.
from rest_framework import viewsets
from .models import Brand, TileCategory, Location, Product, Inventory, StockMovement
from .serializers import (
    BrandSerializer, TileCategorySerializer, LocationSerializer,
    ProductSerializer, InventorySerializer, StockMovementSerializer
)

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class TileCategoryViewSet(viewsets.ModelViewSet):
    queryset = TileCategory.objects.all()
    serializer_class = TileCategorySerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

# inventory/views.py
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": "Unable to delete product. It may be referenced in inventory or sales."},
                status=status.HTTP_400_BAD_REQUEST
            )


# class ProductViewSet(viewsets.ModelViewSet):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

# class StockMovementViewSet(viewsets.ModelViewSet):
#     queryset = StockMovement.objects.all()
#     serializer_class = StockMovementSerializer


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    def perform_create(self, serializer):
        movement = serializer.save()
        # Update inventory quantities
        from_inventory = Inventory.objects.get(
            product=movement.product,
            location=movement.from_location
        )
        from_inventory.quantity -= movement.quantity
        from_inventory.save()

        to_inventory, created = Inventory.objects.get_or_create(
            product=movement.product,
            location=movement.to_location,
            defaults={'quantity': 0}
        )
        to_inventory.quantity += movement.quantity
        to_inventory.save()

    def perform_delete(self, instance):
        # Reverse the inventory changes before deleting
        from_inventory = Inventory.objects.get(
            product=instance.product,
            location=instance.from_location
        )
        from_inventory.quantity += instance.quantity
        from_inventory.save()

        to_inventory = Inventory.objects.get(
            product=instance.product,
            location=instance.to_location
        )
        to_inventory.quantity -= instance.quantity
        to_inventory.save()

        instance.delete()


# inventory/views.py

# class InventoryViewSet(viewsets.ModelViewSet):
#     queryset = Inventory.objects.all()
#     serializer_class = InventorySerializer

#     @action(detail=False, methods=['post'])
#     def update_quantity(self, request):
#         try:
#             product_id = request.data.get('product')
#             location_id = request.data.get('location')
#             quantity_change = int(request.data.get('quantity_change'))

#             inventory_item = Inventory.objects.get(
#                 product_id=product_id,
#                 location_id=location_id
#             )
            
#             inventory_item.quantity += quantity_change
#             if inventory_item.quantity < 0:
#                 return Response(
#                     {"error": "Insufficient inventory"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
                
#             inventory_item.save()
#             return Response(self.serializer_class(inventory_item).data)
#         except Inventory.DoesNotExist:
#             if quantity_change > 0:
#                 inventory_item = Inventory.objects.create(
#                     product_id=product_id,
#                     location_id=location_id,
#                     quantity=quantity_change
#                 )
#                 return Response(self.serializer_class(inventory_item).data)
#             return Response(
#                 {"error": "Inventory item not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )