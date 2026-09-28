using UnityEngine;

namespace MotoEntrega3D.Player
{
    [RequireComponent(typeof(Rigidbody))]
    public class MotorcycleController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float acceleration = 18f;
        [SerializeField] private float maxSpeed = 16f;
        [SerializeField] private float steering = 75f;
        [SerializeField] private float brakeForce = 22f;

        [Header("Mobile Input")]
        [Range(-1f, 1f)] public float throttleInput;
        [Range(-1f, 1f)] public float steeringInput;
        public bool brake;

        private Rigidbody rb;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.interpolation = RigidbodyInterpolation.Interpolate;
            rb.constraints = RigidbodyConstraints.FreezeRotationX |
                             RigidbodyConstraints.FreezeRotationZ;
        }

        private void FixedUpdate()
        {
            float keyboardThrottle = Input.GetAxisRaw("Vertical");
            float keyboardSteering = Input.GetAxisRaw("Horizontal");

            float throttle = Mathf.Abs(throttleInput) > 0.01f ? throttleInput : keyboardThrottle;
            float steer = Mathf.Abs(steeringInput) > 0.01f ? steeringInput : keyboardSteering;

            Vector3 forwardForce = transform.forward * throttle * acceleration;
            if (rb.linearVelocity.magnitude < maxSpeed || throttle < 0f)
                rb.AddForce(forwardForce, ForceMode.Acceleration);

            if (brake || Input.GetKey(KeyCode.Space))
                rb.AddForce(-rb.linearVelocity.normalized * brakeForce, ForceMode.Acceleration);

            float speedFactor = Mathf.Clamp01(rb.linearVelocity.magnitude / 3f);
            transform.Rotate(0f, steer * steering * speedFactor * Time.fixedDeltaTime, 0f);
        }

        public float SpeedKmh => rb.linearVelocity.magnitude * 3.6f;
    }
}
