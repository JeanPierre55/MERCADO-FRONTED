#!/bin/bash
# ============================================================
# Carga los 31 productos del catálogo MERCATO en DynamoDB
# Tabla: pos-serverless-aws-productos
# Región: us-east-1
# ============================================================
# Uso: bash scripts/seed-dynamodb-productos.sh
# ============================================================

TABLE="pos-serverless-aws-productos"
REGION="us-east-1"

echo "🚀 Cargando productos en DynamoDB tabla: $TABLE"
echo ""

put_item() {
  aws dynamodb put-item \
    --table-name "$TABLE" \
    --region "$REGION" \
    --item "$1"
}

# ── Frutas y Verduras ─────────────────────────────────────────────────────────
put_item '{"id":{"S":"1"},"nombre":{"S":"Manzana Roja"},"precio":{"N":"9500"},"categoria":{"S":"frutas-verduras"},"barcode":{"S":"7501234567890"},"stock":{"N":"150"},"unidad":{"S":"kg"}}'
echo "✅ Manzana Roja"

put_item '{"id":{"S":"2"},"nombre":{"S":"Banana"},"precio":{"N":"5200"},"categoria":{"S":"frutas-verduras"},"barcode":{"S":"7501234567891"},"stock":{"N":"200"},"unidad":{"S":"kg"}}'
echo "✅ Banana"

put_item '{"id":{"S":"3"},"nombre":{"S":"Tomate"},"precio":{"N":"4800"},"categoria":{"S":"frutas-verduras"},"barcode":{"S":"7501234567892"},"stock":{"N":"100"},"unidad":{"S":"kg"}}'
echo "✅ Tomate"

put_item '{"id":{"S":"4"},"nombre":{"S":"Lechuga"},"precio":{"N":"3800"},"categoria":{"S":"frutas-verduras"},"barcode":{"S":"7501234567893"},"stock":{"N":"80"},"unidad":{"S":"unidad"}}'
echo "✅ Lechuga"

put_item '{"id":{"S":"5"},"nombre":{"S":"Zanahoria"},"precio":{"N":"3600"},"categoria":{"S":"frutas-verduras"},"barcode":{"S":"7501234567894"},"stock":{"N":"120"},"unidad":{"S":"kg"}}'
echo "✅ Zanahoria"

# ── Lácteos ───────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"6"},"nombre":{"S":"Leche Entera 1L"},"precio":{"N":"4200"},"categoria":{"S":"lacteos"},"barcode":{"S":"7501234567895"},"stock":{"N":"200"},"unidad":{"S":"unidad"}}'
echo "✅ Leche Entera 1L"

put_item '{"id":{"S":"7"},"nombre":{"S":"Yogurt Natural"},"precio":{"N":"5400"},"categoria":{"S":"lacteos"},"barcode":{"S":"7501234567896"},"stock":{"N":"150"},"unidad":{"S":"unidad"}}'
echo "✅ Yogurt Natural"

put_item '{"id":{"S":"8"},"nombre":{"S":"Queso Fresco"},"precio":{"N":"12500"},"categoria":{"S":"lacteos"},"barcode":{"S":"7501234567897"},"stock":{"N":"60"},"unidad":{"S":"unidad"}}'
echo "✅ Queso Fresco"

put_item '{"id":{"S":"9"},"nombre":{"S":"Mantequilla"},"precio":{"N":"8900"},"categoria":{"S":"lacteos"},"barcode":{"S":"7501234567898"},"stock":{"N":"80"},"unidad":{"S":"unidad"}}'
echo "✅ Mantequilla"

put_item '{"id":{"S":"10"},"nombre":{"S":"Crema 500ml"},"precio":{"N":"7600"},"categoria":{"S":"lacteos"},"barcode":{"S":"7501234567899"},"stock":{"N":"50"},"unidad":{"S":"unidad"}}'
echo "✅ Crema 500ml"

# ── Carnes ────────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"11"},"nombre":{"S":"Pechuga de Pollo"},"precio":{"N":"24000"},"categoria":{"S":"carnes"},"barcode":{"S":"7501234567900"},"stock":{"N":"40"},"unidad":{"S":"kg"}}'
echo "✅ Pechuga de Pollo"

put_item '{"id":{"S":"12"},"nombre":{"S":"Carne Molida"},"precio":{"N":"23000"},"categoria":{"S":"carnes"},"barcode":{"S":"7501234567901"},"stock":{"N":"35"},"unidad":{"S":"kg"}}'
echo "✅ Carne Molida"

put_item '{"id":{"S":"13"},"nombre":{"S":"Costillas de Cerdo"},"precio":{"N":"28000"},"categoria":{"S":"carnes"},"barcode":{"S":"7501234567902"},"stock":{"N":"25"},"unidad":{"S":"kg"}}'
echo "✅ Costillas de Cerdo"

put_item '{"id":{"S":"14"},"nombre":{"S":"Salmon Fresco"},"precio":{"N":"48000"},"categoria":{"S":"carnes"},"barcode":{"S":"7501234567903"},"stock":{"N":"20"},"unidad":{"S":"kg"}}'
echo "✅ Salmon Fresco"

# ── Panadería ─────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"15"},"nombre":{"S":"Pan Blanco"},"precio":{"N":"4200"},"categoria":{"S":"panaderia"},"barcode":{"S":"7501234567904"},"stock":{"N":"100"},"unidad":{"S":"unidad"}}'
echo "✅ Pan Blanco"

put_item '{"id":{"S":"16"},"nombre":{"S":"Pan Integral"},"precio":{"N":"5500"},"categoria":{"S":"panaderia"},"barcode":{"S":"7501234567905"},"stock":{"N":"80"},"unidad":{"S":"unidad"}}'
echo "✅ Pan Integral"

put_item '{"id":{"S":"17"},"nombre":{"S":"Croissant"},"precio":{"N":"3800"},"categoria":{"S":"panaderia"},"barcode":{"S":"7501234567906"},"stock":{"N":"60"},"unidad":{"S":"unidad"}}'
echo "✅ Croissant"

put_item '{"id":{"S":"18"},"nombre":{"S":"Dona Chocolate"},"precio":{"N":"4200"},"categoria":{"S":"panaderia"},"barcode":{"S":"7501234567907"},"stock":{"N":"50"},"unidad":{"S":"unidad"}}'
echo "✅ Dona Chocolate"

# ── Bebidas ───────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"19"},"nombre":{"S":"Coca-Cola 2L"},"precio":{"N":"11000"},"categoria":{"S":"bebidas"},"barcode":{"S":"7501234567908"},"stock":{"N":"200"},"unidad":{"S":"unidad"}}'
echo "✅ Coca-Cola 2L"

put_item '{"id":{"S":"20"},"nombre":{"S":"Agua Mineral 1L"},"precio":{"N":"2800"},"categoria":{"S":"bebidas"},"barcode":{"S":"7501234567909"},"stock":{"N":"300"},"unidad":{"S":"unidad"}}'
echo "✅ Agua Mineral 1L"

put_item '{"id":{"S":"21"},"nombre":{"S":"Jugo de Naranja 1L"},"precio":{"N":"7800"},"categoria":{"S":"bebidas"},"barcode":{"S":"7501234567910"},"stock":{"N":"100"},"unidad":{"S":"unidad"}}'
echo "✅ Jugo de Naranja 1L"

put_item '{"id":{"S":"22"},"nombre":{"S":"Cerveza 6-pack"},"precio":{"N":"18000"},"categoria":{"S":"bebidas"},"barcode":{"S":"7501234567911"},"stock":{"N":"80"},"unidad":{"S":"unidad"}}'
echo "✅ Cerveza 6-pack"

# ── Limpieza ──────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"23"},"nombre":{"S":"Detergente 3L"},"precio":{"N":"28900"},"categoria":{"S":"limpieza"},"barcode":{"S":"7501234567912"},"stock":{"N":"60"},"unidad":{"S":"unidad"}}'
echo "✅ Detergente 3L"

put_item '{"id":{"S":"24"},"nombre":{"S":"Jabon Liquido"},"precio":{"N":"13900"},"categoria":{"S":"limpieza"},"barcode":{"S":"7501234567913"},"stock":{"N":"80"},"unidad":{"S":"unidad"}}'
echo "✅ Jabon Liquido"

put_item '{"id":{"S":"25"},"nombre":{"S":"Papel Higienico 12pk"},"precio":{"N":"32900"},"categoria":{"S":"limpieza"},"barcode":{"S":"7501234567914"},"stock":{"N":"100"},"unidad":{"S":"unidad"}}'
echo "✅ Papel Higienico 12pk"

# ── Snacks ────────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"26"},"nombre":{"S":"Papas Fritas"},"precio":{"N":"6200"},"categoria":{"S":"snacks"},"barcode":{"S":"7501234567915"},"stock":{"N":"150"},"unidad":{"S":"unidad"}}'
echo "✅ Papas Fritas"

put_item '{"id":{"S":"27"},"nombre":{"S":"Chocolate Barra"},"precio":{"N":"4500"},"categoria":{"S":"snacks"},"barcode":{"S":"7501234567916"},"stock":{"N":"200"},"unidad":{"S":"unidad"}}'
echo "✅ Chocolate Barra"

put_item '{"id":{"S":"28"},"nombre":{"S":"Galletas Oreo"},"precio":{"N":"5500"},"categoria":{"S":"snacks"},"barcode":{"S":"7501234567917"},"stock":{"N":"120"},"unidad":{"S":"unidad"}}'
echo "✅ Galletas Oreo"

# ── Congelados ────────────────────────────────────────────────────────────────
put_item '{"id":{"S":"29"},"nombre":{"S":"Pizza Congelada"},"precio":{"N":"18500"},"categoria":{"S":"congelados"},"barcode":{"S":"7501234567918"},"stock":{"N":"40"},"unidad":{"S":"unidad"}}'
echo "✅ Pizza Congelada"

put_item '{"id":{"S":"30"},"nombre":{"S":"Helado 1L"},"precio":{"N":"14900"},"categoria":{"S":"congelados"},"barcode":{"S":"7501234567919"},"stock":{"N":"50"},"unidad":{"S":"unidad"}}'
echo "✅ Helado 1L"

put_item '{"id":{"S":"31"},"nombre":{"S":"Nuggets de Pollo"},"precio":{"N":"16900"},"categoria":{"S":"congelados"},"barcode":{"S":"7501234567920"},"stock":{"N":"45"},"unidad":{"S":"unidad"}}'
echo "✅ Nuggets de Pollo"

echo ""
echo "🎉 ¡Listo! 31 productos cargados en DynamoDB."
echo ""
echo "Verificar con:"
echo "  aws dynamodb scan --table-name $TABLE --region $REGION --select COUNT"
