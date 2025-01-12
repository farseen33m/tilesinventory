# inventory/models.py
from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class TileCategory(models.Model):
    SIZES = (
        ('1200x600', '1200x600'),
        ('600x600', '600x600'),
    )
    
    size = models.CharField(max_length=10, choices=SIZES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} - {self.size}"
    
    class Meta:
        verbose_name_plural = "Tile Categories"

class Location(models.Model):
    LOCATION_TYPES = (
        ('GODOWN', 'Godown'),
        ('SHOP', 'Shop'),
    )
    
    name = models.CharField(max_length=100)
    location_type = models.CharField(max_length=10, choices=LOCATION_TYPES)
    address = models.TextField()
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_location_type_display()})"

class Product(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    category = models.ForeignKey(TileCategory, on_delete=models.CASCADE)
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.product_code} - {self.name}"

class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Inventories"
        unique_together = ['product', 'location']
    
    def __str__(self):
        return f"{self.product.name} at {self.location.name}: {self.quantity}"

class StockMovement(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    from_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='stock_out')
    to_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='stock_in')
    quantity = models.IntegerField()
    movement_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.quantity} {self.product.name} moved from {self.from_location.name} to {self.to_location.name}"