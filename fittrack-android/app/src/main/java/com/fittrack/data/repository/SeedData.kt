package com.fittrack.data.repository

import com.fittrack.data.db.FoodEntity
import java.util.UUID

object SeedData {
    val foods: List<FoodEntity> = listOf(
        // Indian Proteins
        food("Chicken Curry (Boneless)", 25f, 5f, 8f, 190, "Protein", "100g"),
        food("Dal (Toor/Moong)", 9f, 20f, 1.5f, 120, "Protein", "1 cup"),
        food("Chole (Chickpeas)", 9f, 27f, 2.7f, 164, "Protein", "1 cup"),
        food("Rajma (Kidney Beans)", 8.7f, 22f, 0.5f, 127, "Protein", "1 cup"),
        food("Egg (Boiled)", 6.3f, 0.6f, 5.3f, 78, "Protein", "1 large"),
        food("Paneer (Regular)", 18f, 1.2f, 11f, 160, "Protein", "100g"),
        food("Fish (Roasted)", 26f, 0f, 3f, 130, "Protein", "100g"),
        food("Greek Yogurt", 10f, 3.6f, 0.4f, 59, "Protein", "100g"),
        food("Milk (Cow)", 3.2f, 4.8f, 3.3f, 61, "Protein", "100ml"),
        food("Tofu", 8.1f, 1.9f, 4.8f, 76, "Protein", "100g"),
        food("Sprouts (Mung)", 3f, 7f, 0.2f, 30, "Protein", "100g"),
        food("Curd/Yogurt", 3.5f, 4.7f, 0.4f, 40, "Protein", "100g"),

        // Indian Carbs
        food("Basmati Rice (Cooked)", 2.7f, 28f, 0.3f, 130, "Carbs", "1 cup"),
        food("Brown Rice", 2.6f, 23f, 0.9f, 111, "Carbs", "1 cup"),
        food("Roti (Whole Wheat)", 4f, 22f, 1.5f, 120, "Carbs", "1 medium"),
        food("Paratha", 5f, 25f, 6f, 170, "Carbs", "1 medium"),
        food("Naan (Regular)", 5.5f, 33f, 4f, 190, "Carbs", "1 medium"),
        food("Chapati (Whole Wheat)", 4.2f, 22f, 1.2f, 115, "Carbs", "1 medium"),
        food("Idli (Steamed)", 2f, 13f, 0.5f, 60, "Carbs", "1 medium"),
        food("Dosa (Rice Crepe)", 3f, 22f, 3f, 125, "Carbs", "1 medium"),
        food("Upma (Semolina)", 4f, 18f, 2f, 110, "Carbs", "100g"),
        food("Poha (Flattened Rice)", 1.5f, 20f, 0.5f, 85, "Carbs", "100g"),
        food("Sweet Potato", 1.6f, 20f, 0.1f, 86, "Carbs", "100g"),
        food("Banana", 1.3f, 27f, 0.3f, 105, "Carbs", "1 medium"),
        food("Mango", 0.7f, 25f, 0.3f, 100, "Carbs", "1 medium"),
        food("Oatmeal", 10f, 54f, 8f, 300, "Carbs", "100g"),

        // Vegetables
        food("Spinach (Palak)", 2.7f, 3.6f, 0.4f, 23, "Vegetables", "100g"),
        food("Bottle Gourd (Lauki)", 0.6f, 3.4f, 0.1f, 15, "Vegetables", "100g"),
        food("Bitter Gourd (Karela)", 0.6f, 3.7f, 0.2f, 17, "Vegetables", "100g"),
        food("Okra (Bhindi)", 1.9f, 7f, 0.2f, 31, "Vegetables", "100g"),
        food("Brinjal (Eggplant)", 0.98f, 5.2f, 0.18f, 25, "Vegetables", "100g"),
        food("Cauliflower", 1.9f, 5f, 0.3f, 25, "Vegetables", "100g"),
        food("Peas (Green)", 5f, 11f, 0.4f, 81, "Vegetables", "100g"),
        food("Carrot", 0.6f, 10f, 0.2f, 41, "Vegetables", "100g"),
        food("Cucumber", 0.7f, 3.6f, 0.1f, 16, "Vegetables", "100g"),
        food("Tomato", 0.9f, 3.9f, 0.2f, 18, "Vegetables", "100g"),
        food("Onion", 1.1f, 9f, 0.1f, 40, "Vegetables", "100g"),

        // Fats & Oils
        food("Ghee (Clarified Butter)", 0f, 0f, 14f, 120, "Fats", "1 tbsp"),
        food("Coconut Oil", 0f, 0f, 14f, 120, "Fats", "1 tbsp"),
        food("Olive Oil", 0f, 0f, 14f, 120, "Fats", "1 tbsp"),
        food("Peanuts", 7f, 5f, 14f, 161, "Fats", "1 ounce"),
        food("Almonds", 6f, 6f, 14f, 164, "Fats", "1 ounce"),
        food("Cashew", 5f, 9f, 13f, 157, "Fats", "1 ounce"),
        food("Peanut Butter", 8f, 7f, 8f, 128, "Fats", "2 tbsp"),

        // Western Proteins
        food("Chicken Breast", 31f, 0f, 3.6f, 165, "Protein", "100g"),
        food("Salmon", 25f, 0f, 13f, 208, "Protein", "100g"),
        food("Ground Beef", 26f, 0f, 15f, 250, "Protein", "100g"),

        // Snacks
        food("Samosa", 3f, 18f, 7f, 145, "Carbs", "1 medium"),
        food("Halwa (Semolina)", 3f, 30f, 6f, 165, "Carbs", "100g"),
    )

    private fun food(name: String, protein: Float, carbs: Float, fat: Float, cal: Int, cat: String, serving: String) =
        FoodEntity(
            id = UUID.nameUUIDFromBytes(name.toByteArray()).toString(),
            name = name, protein_g = protein, carbs_g = carbs, fat_g = fat,
            calories = cal, category = cat, serving_size = serving
        )
}
