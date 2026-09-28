using UnityEngine;

namespace MotoEntrega3D.Core
{
    public static class RuntimeEntryPoint
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void StartPrototype()
        {
            if (Object.FindFirstObjectByType<PrototypeBootstrap>() != null)
                return;

            var go = new GameObject("MotoEntrega3D_Runtime");
            go.AddComponent<PrototypeBootstrap>();
        }
    }
}
