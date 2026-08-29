import React, { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { Utensils, Sparkles, X, Plus, CheckCircle2, ChevronRight } from "lucide-react";

interface KitchenNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KitchenNutritionModal: React.FC<KitchenNutritionModalProps> = ({ isOpen, onClose }) => {
  const { activeLifeStage, todayLog } = useHealth();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    "Eggs",
    "Spinach",
    "Avocado",
    "Oats",
    "Chia Seeds",
    "Greek Yogurt",
  ]);
  const [customIng, setCustomIng] = useState("");
  const [activeMealPlan, setActiveMealPlan] = useState<number | null>(0);

  if (!isOpen) return null;

  const sampleIngredients = [
    "Eggs",
    "Spinach",
    "Avocado",
    "Oats",
    "Chia Seeds",
    "Greek Yogurt",
    "Salmon",
    "Sweet Potato",
    "Lentils",
    "Pumpkin Seeds",
    "Blueberries",
    "Dark Chocolate",
    "Broccoli",
    "Quinoa",
  ];

  const getRecommendations = () => {
    switch (activeLifeStage) {
      case "pregnant":
        return [
          {
            title: "Choline & Folate Power Scramble",
            ingredients: ["Pasture Eggs", "Sautéed Spinach", "Sliced Avocado"],
            focus: "Fetal neural tube support & maternal blood volume",
            nutrients: "Choline (300mg), Folate (180mcg), Healthy Lipids",
          },
          {
            title: "Iron & Vitamin C Morning Bowl",
            ingredients: ["Oats", "Chia Seeds", "Blueberries", "Pumpkin Seeds"],
            focus: "Cellular energy & plant iron absorption with bioflavonoids",
            nutrients: "Non-heme Iron (4mg), Omega-3 ALA, Fiber (9g)",
          },
        ];
      case "postpartum":
        return [
          {
            title: "Warm Golden Lactation & Healing Porridge",
            ingredients: ["Oats", "Chia Seeds", "Turmeric", "Almond Butter"],
            focus: "Tissue healing, prolactin support, and warmth for digestion",
            nutrients: "Beta-glucan, Zinc, Magnesium, Anti-inflammatory curcumin",
          },
          {
            title: "Postpartum High-Protein Recovery Bowl",
            ingredients: ["Eggs", "Greek Yogurt", "Sweet Potato", "Spinach"],
            focus: "Perineal & pelvic floor collagen repair",
            nutrients: "Bioavailable Protein (32g), Vitamin A, Potassium",
          },
        ];
      case "perimenopause":
      case "menopause":
        return [
          {
            title: "Phytoestrogen & Bone Density Power Salad",
            ingredients: ["Spinach", "Quinoa", "Pumpkin Seeds", "Avocado", "Flax/Chia"],
            focus: "Vasomotor flash dampening & osteo-protective calcium cofactors",
            nutrients: "Lignans, Calcium (280mg), Magnesium, Vitamin K2",
          },
        ];
      default: // cycling & luteal
        return [
          {
            title: "Luteal Magnesium & B6 Harmony Skillet",
            ingredients: ["Eggs", "Spinach", "Avocado", "Sweet Potato"],
            focus: "Progesterone synthesis & neurochemical serotonin support",
            nutrients: "Magnesium (140mg), Vitamin B6 (0.8mg), Potassium",
          },
          {
            title: "Slow-Carb Blood Sugar Stabilizing Bowl",
            ingredients: ["Greek Yogurt", "Chia Seeds", "Blueberries", "Pumpkin Seeds"],
            focus: "Prevents luteal glucose spikes and pre-menstrual energy drops",
            nutrients: "Protein (24g), Zinc (3mg), Low Glycemic Index",
          },
        ];
    }
  };

  const mealPlans = getRecommendations();

  const handleToggleIngredient = (ing: string) => {
    if (selectedIngredients.includes(ing)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== ing));
    } else {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIng.trim()) return;
    if (!selectedIngredients.includes(customIng.trim())) {
      setSelectedIngredients([...selectedIngredients, customIng.trim()]);
    }
    setCustomIng("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#FFDADA] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#FFDADA] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#D9455D] bg-[#FFF5F7] px-2.5 py-0.5 rounded-full border border-[#FFDADA]">
                Nutrient Synchronizer
              </span>
              <span className="text-xs text-[#8E7A81]">Life-Stage Targeted</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D2226] mt-1">
              What's in My Kitchen?
            </h2>
            <p className="text-xs text-[#735E65]">
              Select what you have at home to generate balanced, hormone-supportive meal pairings tailored to your current life stage.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8E7A81] hover:text-[#2D2226] rounded-lg hover:bg-[#FFF5F7] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingredients Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#2D2226] block">
            Select items available in your kitchen:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sampleIngredients.map((ing) => {
              const isSelected = selectedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  onClick={() => handleToggleIngredient(ing)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#FF788D] text-white border-[#FF788D] shadow-2xs font-semibold"
                      : "bg-[#FFF5F7] border-[#FFDADA] text-[#2D2226] hover:bg-[#FFEDF1]"
                  }`}
                >
                  {isSelected ? `✓ ${ing}` : `+ ${ing}`}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustom} className="flex gap-2 pt-1">
            <input
              type="text"
              value={customIng}
              onChange={(e) => setCustomIng(e.target.value)}
              placeholder="Add other ingredient (e.g., Tofu, Walnuts)..."
              className="flex-1 px-3 py-1.5 text-xs border border-[#FFDADA] rounded-xl bg-[#FFF5F7] text-[#2D2226] placeholder-[#8E7A81]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#FF788D] hover:bg-[#E85C71] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              Add
            </button>
          </form>
        </div>

        {/* Recommended Meal Pairings */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-[#2D2226] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF788D]" />
            <span>Targeted Life-Stage Meal Recommendations:</span>
          </h3>

          <div className="space-y-3">
            {mealPlans.map((meal, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#FFDADA] bg-[#FFF5F7] hover:bg-[#FFEDF1] transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-[#2D2226]">{meal.title}</h4>
                  <span className="text-[11px] font-semibold bg-white text-[#D9455D] px-2 py-0.5 rounded border border-[#FFDADA]">
                    High Nutrient Match
                  </span>
                </div>
                <p className="text-xs text-[#2D2226] font-medium">{meal.focus}</p>
                <div className="flex flex-wrap gap-1">
                  {meal.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-white text-[#2D2226] border border-[#FFDADA] px-2 py-0.5 rounded"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#D9455D] font-mono bg-white p-2 rounded-lg border border-[#FFDADA]">
                  Key Micronutrients: {meal.nutrients}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#FFDADA]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#FF788D] hover:bg-[#E85C71] rounded-xl cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
