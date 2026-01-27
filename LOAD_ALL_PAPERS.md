# Load All SSC CGL Papers - Quick Guide

## 📚 You have 239 papers ready to load!

### Step 1: Generate the Loader (Already Done!)
The `generated-loader.ts` file has been created with all 239 papers mapped.

### Step 2: Import and Use in Your App

Add this to your [project/app/_layout.tsx](project/app/_layout.tsx):

```typescript
import { useEffect, useState } from 'react';
import { loadAllSSCCGLPapers, loadPapersByYear, TOTAL_PAPERS } from '../scripts/generated-loader';

export default function RootLayout() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    // Option 1: Load ALL 239 papers (takes ~10-15 seconds)
    const loadPapers = async () => {
      console.log(`Loading ${TOTAL_PAPERS} papers...`);
      const result = await loadAllSSCCGLPapers();
      console.log(`Done! Loaded: ${result.loaded}, Failed: ${result.failed}`);
    };
    
    // Option 2: Load only specific year papers (faster)
    const loadYear = async () => {
      await loadPapersByYear(2024); // Load 2024 papers only
    };
    
    // Choose one:
    loadPapers(); // Load all
    // loadYear(); // Load specific year
  }, []);

  // ... rest of your layout code
}
```

### Step 3: Alternative - Load on Demand

Load papers when needed (recommended for better performance):

```typescript
// In your test-list.tsx screen
import { loadPapersByYear } from '../scripts/generated-loader';

export default function TestListScreen() {
  const [selectedYear, setSelectedYear] = useState(2024);
  
  useEffect(() => {
    loadPapersByYear(selectedYear);
  }, [selectedYear]);
  
  // ... rest of your component
}
```

## 📊 Available Papers by Year

Based on the scan:
- **2017**: Multiple papers
- **2019**: Multiple papers  
- **2020**: 21 papers
- **2021**: 21 papers
- **2022**: 39 papers
- **2023**: 39 papers
- **2024**: 35 papers

**Total: 239 papers** (excluding failed ones)

## 🚀 Usage Options

### Option A: Load Everything at Startup
**Pros**: All tests available immediately  
**Cons**: Longer initial load time (~10-15 sec)

```typescript
import { loadAllSSCCGLPapers } from '../scripts/generated-loader';
await loadAllSSCCGLPapers();
```

### Option B: Load by Year (Recommended)
**Pros**: Faster loading, still good selection  
**Cons**: Need to load more if user switches year

```typescript
import { loadPapersByYear } from '../scripts/generated-loader';
await loadPapersByYear(2024); // Load latest papers
```

### Option C: Load Individual Papers
**Pros**: Fastest, minimal memory  
**Cons**: Need to manage loading for each test

```typescript
import { SSCCGLService } from '../services/ssc-cgl-service';
import paper from '../../SSC_CGL/SSC CGL 2024...json';
import answers from '../../ai_generated_answers/SSC CGL 2024...json';

const service = SSCCGLService.getInstance();
await service.loadPaper('paper-id', paper, answers);
```

## ✅ Next Steps

1. **Update [project/app/_layout.tsx](project/app/_layout.tsx)** to load papers
2. **Test the flow**: Home → Test List → Select Test → Take Test → View Results
3. **Optimize**: If loading is slow, switch to Option B (load by year)

## 🛠 Regenerate Loader

If you add more papers to the folders, regenerate the loader:

```powershell
cd C:\Users\aloo\exam-ai
# Run the inline script again (see terminal history)
```

## 📖 Related Files

- **Generated Loader**: [project/scripts/generated-loader.ts](project/scripts/generated-loader.ts) (239 papers mapped)
- **Service**: [project/services/ssc-cgl-service.ts](project/services/ssc-cgl-service.ts)
- **Test List Screen**: [project/app/test-list.tsx](project/app/test-list.tsx)
- **Mock Test Screen**: [project/app/mock-test.tsx](project/app/mock-test.tsx)
- **Results Screen**: [project/app/test-result.tsx](project/app/test-result.tsx)

## 🎯 Quick Command

To load all papers immediately, add this to your app layout:

```typescript
import { loadAllSSCCGLPapers, TOTAL_PAPERS } from '../scripts/generated-loader';

console.log(`Found ${TOTAL_PAPERS} papers to load`);
loadAllSSCCGLPapers().then(result => {
  console.log(`✅ Loaded ${result.loaded} papers successfully!`);
});
```

Done! All 239 papers are ready to use! 🎉
