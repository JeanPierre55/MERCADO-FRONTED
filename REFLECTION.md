# Reflection: SDD vs Traditional Development

Spec-Driven Development (SDD) cambia el orden clasico de trabajo: primero define contrato y despues implementa. En este proyecto POS, esa inversion de orden redujo ambiguedad y evito retrabajo, especialmente en flujos sensibles como checkout y calculo de totales.

En un enfoque tradicional rapido, suele iniciarse por UI y luego se corrigen reglas de negocio sobre la marcha. Eso acelera una primera demo, pero introduce deuda: decisiones no documentadas, cobertura funcional desigual y dificultad para validar si una historia realmente se completo. En contraste, con SDD cada componente nace con un proposito trazable a un requisito y criterio de aceptacion.

El mayor beneficio observado fue la trazabilidad. Al mapear requisitos (FR) hacia tareas y archivos concretos, fue posible identificar huecos reales del proyecto: pago mixto y escaneo por camara figuraban en el contexto funcional, pero no estaban implementados de extremo a extremo. Con SDD, esas brechas aparecen temprano porque tasks y acceptance criteria hacen visible lo que falta.

Otro valor fuerte fue la calidad de decisiones tecnicas. El documento de diseno obligo a formalizar arquitectura y flujo de datos antes de tocar codigo. Esto ayudo a mantener coherencia con el stack existente (React, Zustand, PrimeReact) sin sobreingenieria. Tambien facilito introducir persistencia offline con bajo riesgo, al definir claramente que estados eran core y debian rehidratarse.

En costos, SDD exige mas disciplina inicial. Escribir `requirements.md`, `design.md` y `tasks.md` toma tiempo, y al principio puede sentirse mas lento que codificar directo. Sin embargo, en un dominio transaccional como POS, ese tiempo se recupera al disminuir errores funcionales, reducir cambios contradictorios y mejorar la validacion final.

Como conclusion, SDD no reemplaza la capacidad tecnica de implementacion, pero mejora significativamente el control del alcance y la confiabilidad del resultado. Para aplicaciones con reglas de negocio claras y criterios evaluables (como un terminal de caja), SDD ofrece una ruta mas predecible, mantenible y auditable que el desarrollo tradicional orientado solo a iteracion de interfaz.
