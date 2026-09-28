using UnityEngine;

namespace MotoEntrega3D.Core
{
    [DefaultExecutionOrder(-100)]
    public class PrototypeRunner : MonoBehaviour
    {
        private void Awake()
        {
            if (FindFirstObjectByType<PrototypeBootstrap>() == null)
                gameObject.AddComponent<PrototypeBootstrap>();
        }
    }
}
