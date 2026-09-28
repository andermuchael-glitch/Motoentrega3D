using UnityEngine;

namespace MotoEntrega3D.Player
{
    public class ThirdPersonCamera : MonoBehaviour
    {
        public Transform Target { get; set; }

        [SerializeField] private Vector3 offset = new Vector3(0f, 5f, -9f);
        [SerializeField] private float smooth = 6f;

        private void LateUpdate()
        {
            if (Target == null) return;

            Vector3 desired = Target.TransformPoint(offset);
            transform.position = Vector3.Lerp(transform.position, desired, smooth * Time.deltaTime);

            Vector3 lookPoint = Target.position + Vector3.up * 1.2f;
            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                Quaternion.LookRotation(lookPoint - transform.position),
                smooth * Time.deltaTime);
        }
    }
}
