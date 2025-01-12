# Register your models here.
# inventory/admin.py
from django.contrib import admin
from .models import Brand, TileCategory, Product, Location, Inventory, StockMovement

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(TileCategory)
class TileCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'size', 'description')
    list_filter = ('size',)
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_code', 'name', 'brand', 'category', 'price')
    list_filter = ('brand', 'category')
    search_fields = ('product_code', 'name')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'location_type', 'address', 'contact_number')
    list_filter = ('location_type',)
    search_fields = ('name', 'address')

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'location', 'quantity', 'last_updated')
    list_filter = ('location',)
    search_fields = ('product__name', 'location__name')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'from_location', 'to_location', 'quantity', 'movement_date')
    list_filter = ('from_location', 'to_location')
    search_fields = ('product__name',)