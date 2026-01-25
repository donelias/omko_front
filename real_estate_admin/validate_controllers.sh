#!/bin/bash

echo "Validating all API controllers..."

controllers=(
    "app/Http/Controllers/Api/PropertyApiController.php"
    "app/Http/Controllers/Api/UserApiController.php"
    "app/Http/Controllers/Api/ChatApiController.php"
    "app/Http/Controllers/Api/PaymentApiController.php"
    "app/Http/Controllers/Api/PackageApiController.php"
    "app/Http/Controllers/Api/InterestApiController.php"
)

all_valid=true

for controller in "${controllers[@]}"; do
    echo "Checking $controller..."
    if php -l "$controller" 2>&1 | grep -q "No syntax errors"; then
        echo "  ✅ Valid"
    else
        echo "  ❌ Invalid"
        php -l "$controller"
        all_valid=false
    fi
done

if $all_valid; then
    echo ""
    echo "✅ All API controllers syntax valid!"
    exit 0
else
    echo ""
    echo "❌ Some controllers have syntax errors"
    exit 1
fi
