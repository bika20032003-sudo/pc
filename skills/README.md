# 🛠️ مهارات وكلاء الذكاء الاصطناعي (Agent Skills)

تحتوي هذه المنظومة على **35 مهارة برمجية وهندسية متقدمة** تم دمجها وتفعيلها لتعمل جنباً إلى جنب:
- **حزمة Superpowers & Repo Kit** (10 مهارات من مستودع [ismail9k/skills](https://github.com/ismail9k/skills.git))
- **حزمة هندسة الإنتاج ودورة حياة البرمجيات** (25 مهارة من مستودع [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills.git))

---

## 📦 أولاً: مهارات Addy Osmani (هندسة البرمجيات والإنتاج الكامل - 25 مهارة)

### 1. التخطيط والتصميم والمواصفات (Planning & Architecture)
* **[spec-driven-development](./spec-driven-development/SKILL.md)**: كتابة مواصفات تقنية دقيقة ومتينة قبل البدء بكتابة أي سطر برمجي.
* **[planning-and-task-breakdown](./planning-and-task-breakdown/SKILL.md)**: تفكيك المشاريع الكبيرة إلى مراحل ومهام قابلة للتنفيذ المتسلسل دون مخاطر.
* **[api-and-interface-design](./api-and-interface-design/SKILL.md)**: تصميم واجهات برمجية ونماذج بيانات نظيفة وقابلة للتوسع.
* **[idea-refine](./idea-refine/SKILL.md)**: صقل وتحسين الأفكار والميزات الجديدة وتوضيح متطلباتها.
* **[interview-me](./interview-me/SKILL.md)**: إجراء مقابلة تفاعلية لاستخراج كافة التفاصيل والقرارات التصميمية من المطور.
* **[documentation-and-adrs](./documentation-and-adrs/SKILL.md)**: توثيق القرارات المعمارية (ADRs) والأدلة التقنية للمشروع.

### 2. جودة الكود والتبسيط (Code Quality & Refactoring)
* **[code-simplification](./code-simplification/SKILL.md)**: تبسيط الشيفرات المعقدة، إزالة التعقيد الزائد، وتحسين القراءة والصيانة.
* **[code-review-and-quality](./code-review-and-quality/SKILL.md)**: مراجعة الكود الصارمة بناءً على معايير الجودة العالمية وأفضل الممارسات.
* **[incremental-implementation](./incremental-implementation/SKILL.md)**: التنفيذ التدريجي التراكمي للميزات مع الحفاظ على استقرار النظام في كل خطوة.
* **[constraint-driven-development](./constraint-driven-development/SKILL.md)**: التطوير المقيد بضوابط صارمة (الأداء، الأمان، التوافق، المتطلبات).
* **[doubt-driven-development](./doubt-driven-development/SKILL.md)**: التشكيك المنهجي في الافتراضات واختبار الحالات الشاذة (Edge cases).
* **[source-driven-development](./source-driven-development/SKILL.md)**: الاعتماد الحصري على الحقائق والمصادر البرمجية المعتمدة وتجنب التخمين.

### 3. الواجهات الأمامية والمتصفح (Frontend & DevTools)
* **[frontend-ui-engineering](./frontend-ui-engineering/SKILL.md)**: هندسة واجهات المستخدم الحديثة، التجاوبية، إمكانية الوصول، وحالات التحميل والخطأ.
* **[browser-testing-with-devtools](./browser-testing-with-devtools/SKILL.md)**: اختبار وتصحيح الواجهات في المتصفح الفعلي باستخدام أدوات Chrome DevTools.

### 4. الأمان والأداء والمراقبة (Security, Performance & Observability)
* **[security-and-hardening](./security-and-hardening/SKILL.md)**: فحص الثغرات الأمنية، حماية المصادقة والجلسات، وتأمين تدفق البيانات.
* **[performance-optimization](./performance-optimization/SKILL.md)**: تسريع تحميل الصفحات، تقليل استهلاك الذاكرة، وتحسين مقاييس Core Web Vitals.
* **[observability-and-instrumentation](./observability-and-instrumentation/SKILL.md)**: إضافة سجلات التتبع، مراقبة الأخطاء، وقياس أداء العمليات الحيوية.

### 5. الاختبارات وتصحيح الأخطاء (Testing & Debugging)
* **[test-driven-development](./test-driven-development/SKILL.md)**: التطوير الموجه بالاختبارات (TDD) لضمان خلو التعديلات من الانتكاسات.
* **[debugging-and-error-recovery](./debugging-and-error-recovery/SKILL.md)**: تشخيص الأعطال المعقدة، تحليل السجلات، واستعادة الاستقرار.

### 6. النشر والتشغيل والإدارة (CI/CD, Git & Operations)
* **[git-workflow-and-versioning](./git-workflow-and-versioning/SKILL.md)**: تنظيم فروع Git، دمج التعديلات، وكتابة التزامات دلالية منسقة.
* **[ci-cd-and-automation](./ci-cd-and-automation/SKILL.md)**: إعداد أتمتة خطوط البناء والاختبار والنشر المستمر.
* **[shipping-and-launch](./shipping-and-launch/SKILL.md)**: إعداد قوائم الإطلاق النهائي للمنتج والتحقق من جاهزية الإنتاج.
* **[deprecation-and-migration](./deprecation-and-migration/SKILL.md)**: إدارة ترحيل التقنيات القديمة واستبدال المكونات المتقادمة بسلاسة.
* **[context-engineering](./context-engineering/SKILL.md)**: ضبط وإدارة سياق الذكاء الاصطناعي لرفع كفاءة الاستجابة ودقتها.
* **[using-agent-skills](./using-agent-skills/SKILL.md)**: دليل التشغيل والتنسيق بين مهارات الوكلاء المختلفة.

---

## 📂 ثانياً: مهارات Ismail (9K) (إدارة المهام والتدقيق المعماري - 10 مهارات)

1. **[anti-koshary](./anti-koshary/SKILL.md)**:
   * تدقيق شامل للكود المعقد، إعادة هيكلة الطبقات، وإصلاح الكود المتكرر بأمان.
2. **[implement-issues](./implement-issues/SKILL.md)**:
   * إسناد تذاكر ومشاكل GitHub (Issues) للوكلاء لحلها وفتح Pull Requests تلقائياً.
3. **[review-prs](./review-prs/SKILL.md)**:
   * فحص ومراجعة طلبات السحب (PRs) وتدقيق الشيفرة قبل الدمج.
4. **[answer-pr-reviews](./answer-pr-reviews/SKILL.md)**:
   * الرد على مراجعات وتعليقات المطورين وتطبيق التعديلات المطلوبة.
5. **[fetch-issues](./fetch-issues/SKILL.md)**:
   * جلب واستعراض التذاكر والمشاكل المفتوحة من GitHub.
6. **[brainstorm-to-issue](./brainstorm-to-issue/SKILL.md)**:
   * تحويل النقاشات والأفكار إلى تذاكر مهام منظمة.
7. **[setup-agent-md](./setup-agent-md/SKILL.md)**:
   * إنشاء وضبط ملف التعليمات المركزي `AGENTS.md`.
8. **[setup-delivery](./setup-delivery/SKILL.md)**:
   * تهيئة إعدادات التسليم ونماذج الذكاء الاصطناعي المستخدمة.
9. **[setup-issue-tracker](./setup-issue-tracker/SKILL.md)**:
   * إعداد نظام تتبع المهام البرمجية في المشروع.
10. **[superpowers-issue-bridge](./superpowers-issue-bridge/SKILL.md)**:
    * الربط التلقائي بين خطط العمل وتذاكر GitHub.
